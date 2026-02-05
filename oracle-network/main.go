package main

import (
	"context"
	"crypto/sha256"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"net/http"
	"sync"
	"time"
)

type PriceData struct {
	Symbol    string    `json:"symbol"`
	Price     *big.Int  `json:"price"`
	Timestamp int64     `json:"timestamp"`
	Source    string    `json:"source"`
	Signature string    `json:"signature"`
}

type OracleNode struct {
	ID        string `json:"id"`
	Address   string `json:"address"`
	Stake     *big.Int `json:"stake"`
	Reputation int    `json:"reputation"`
	Active    bool   `json:"active"`
}

type Consensus struct {
	Symbol     string     `json:"symbol"`
	Price      *big.Int   `json:"price"`
	Confidence float64    `json:"confidence"`
	Nodes      []string   `json:"nodes"`
	Timestamp  int64      `json:"timestamp"`
}

type OracleNetwork struct {
	nodes       map[string]*OracleNode
	priceFeeds  map[string][]*PriceData
	consensus   map[string]*Consensus
	mu          sync.RWMutex
	minNodes    int
	threshold   float64
}

func NewOracleNetwork() *OracleNetwork {
	return &OracleNetwork{
		nodes:      make(map[string]*OracleNode),
		priceFeeds: make(map[string][]*PriceData),
		consensus:  make(map[string]*Consensus),
		minNodes:   3,
		threshold:  0.67, // 67% consensus required
	}
}

func (on *OracleNetwork) RegisterNode(node *OracleNode) error {
	on.mu.Lock()
	defer on.mu.Unlock()
	
	if _, exists := on.nodes[node.ID]; exists {
		return fmt.Errorf("node %s already registered", node.ID)
	}
	
	on.nodes[node.ID] = node
	log.Printf("Node %s registered with stake %s", node.ID, node.Stake.String())
	return nil
}

func (on *OracleNetwork) SubmitPrice(nodeID string, data *PriceData) error {
	on.mu.Lock()
	defer on.mu.Unlock()
	
	node, exists := on.nodes[nodeID]
	if !exists || !node.Active {
		return fmt.Errorf("node %s not found or inactive", nodeID)
	}
	
	// Validate signature (simplified)
	if !on.validateSignature(data) {
		return fmt.Errorf("invalid signature")
	}
	
	// Add to price feeds
	if on.priceFeeds[data.Symbol] == nil {
		on.priceFeeds[data.Symbol] = make([]*PriceData, 0)
	}
	
	on.priceFeeds[data.Symbol] = append(on.priceFeeds[data.Symbol], data)
	
	// Keep only recent data (last 100 entries)
	if len(on.priceFeeds[data.Symbol]) > 100 {
		on.priceFeeds[data.Symbol] = on.priceFeeds[data.Symbol][len(on.priceFeeds[data.Symbol])-100:]
	}
	
	// Trigger consensus calculation
	go on.calculateConsensus(data.Symbol)
	
	return nil
}

func (on *OracleNetwork) validateSignature(data *PriceData) bool {
	// Simplified signature validation
	hash := sha256.Sum256([]byte(fmt.Sprintf("%s%s%d", data.Symbol, data.Price.String(), data.Timestamp)))
	expectedSig := fmt.Sprintf("%x", hash[:8])
	return data.Signature == expectedSig
}

func (on *OracleNetwork) calculateConsensus(symbol string) {
	on.mu.Lock()
	defer on.mu.Unlock()
	
	feeds := on.priceFeeds[symbol]
	if len(feeds) < on.minNodes {
		return
	}
	
	// Get recent prices (last 5 minutes)
	now := time.Now().Unix()
	recentFeeds := make([]*PriceData, 0)
	
	for _, feed := range feeds {
		if now-feed.Timestamp <= 300 { // 5 minutes
			recentFeeds = append(recentFeeds, feed)
		}
	}
	
	if len(recentFeeds) < on.minNodes {
		return
	}
	
	// Group by node and get latest from each
	nodeLatest := make(map[string]*PriceData)
	for _, feed := range recentFeeds {
		if existing, exists := nodeLatest[feed.Source]; !exists || feed.Timestamp > existing.Timestamp {
			nodeLatest[feed.Source] = feed
		}
	}
	
	if len(nodeLatest) < on.minNodes {
		return
	}
	
	// Calculate weighted median
	prices := make([]*big.Int, 0)
	weights := make([]*big.Int, 0)
	nodes := make([]string, 0)
	
	for nodeID, feed := range nodeLatest {
		if node, exists := on.nodes[nodeID]; exists && node.Active {
			prices = append(prices, feed.Price)
			weights = append(weights, node.Stake)
			nodes = append(nodes, nodeID)
		}
	}
	
	if len(prices) < on.minNodes {
		return
	}
	
	consensusPrice := on.weightedMedian(prices, weights)
	confidence := on.calculateConfidence(prices, consensusPrice)
	
	if confidence >= on.threshold {
		on.consensus[symbol] = &Consensus{
			Symbol:     symbol,
			Price:      consensusPrice,
			Confidence: confidence,
			Nodes:      nodes,
			Timestamp:  now,
		}
		
		log.Printf("Consensus reached for %s: %s (confidence: %.2f)", symbol, consensusPrice.String(), confidence)
	}
}

func (on *OracleNetwork) weightedMedian(prices []*big.Int, weights []*big.Int) *big.Int {
	// Simplified weighted median calculation
	if len(prices) == 0 {
		return big.NewInt(0)
	}
	
	// For simplicity, return the middle price when sorted
	// In production, implement proper weighted median
	sorted := make([]*big.Int, len(prices))
	copy(sorted, prices)
	
	// Simple bubble sort
	for i := 0; i < len(sorted); i++ {
		for j := i + 1; j < len(sorted); j++ {
			if sorted[i].Cmp(sorted[j]) > 0 {
				sorted[i], sorted[j] = sorted[j], sorted[i]
			}
		}
	}
	
	return sorted[len(sorted)/2]
}

func (on *OracleNetwork) calculateConfidence(prices []*big.Int, consensus *big.Int) float64 {
	if len(prices) == 0 {
		return 0.0
	}
	
	agreementCount := 0
	threshold := new(big.Int).Div(consensus, big.NewInt(20)) // 5% threshold
	
	for _, price := range prices {
		diff := new(big.Int).Sub(price, consensus)
		diff.Abs(diff)
		
		if diff.Cmp(threshold) <= 0 {
			agreementCount++
		}
	}
	
	return float64(agreementCount) / float64(len(prices))
}

func (on *OracleNetwork) GetPrice(symbol string) (*Consensus, error) {
	on.mu.RLock()
	defer on.mu.RUnlock()
	
	consensus, exists := on.consensus[symbol]
	if !exists {
		return nil, fmt.Errorf("no consensus for symbol %s", symbol)
	}
	
	// Check if consensus is fresh (within 10 minutes)
	if time.Now().Unix()-consensus.Timestamp > 600 {
		return nil, fmt.Errorf("stale consensus for symbol %s", symbol)
	}
	
	return consensus, nil
}

func (on *OracleNetwork) GetAllPrices() map[string]*Consensus {
	on.mu.RLock()
	defer on.mu.RUnlock()
	
	result := make(map[string]*Consensus)
	now := time.Now().Unix()
	
	for symbol, consensus := range on.consensus {
		if now-consensus.Timestamp <= 600 { // Fresh within 10 minutes
			result[symbol] = consensus
		}
	}
	
	return result
}

func (on *OracleNetwork) UpdateNodeReputation(nodeID string, delta int) {
	on.mu.Lock()
	defer on.mu.Unlock()
	
	if node, exists := on.nodes[nodeID]; exists {
		node.Reputation += delta
		if node.Reputation < 0 {
			node.Reputation = 0
		}
		
		// Deactivate nodes with very low reputation
		if node.Reputation < -100 {
			node.Active = false
			log.Printf("Node %s deactivated due to low reputation", nodeID)
		}
	}
}

func (on *OracleNetwork) StartHTTPServer(port string) {
	http.HandleFunc("/price/", func(w http.ResponseWriter, r *http.Request) {
		symbol := r.URL.Path[len("/price/"):]
		
		consensus, err := on.GetPrice(symbol)
		if err != nil {
			http.Error(w, err.Error(), http.StatusNotFound)
			return
		}
		
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(consensus)
	})
	
	http.HandleFunc("/prices", func(w http.ResponseWriter, r *http.Request) {
		prices := on.GetAllPrices()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(prices)
	})
	
	http.HandleFunc("/submit", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != "POST" {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		
		var submission struct {
			NodeID string     `json:"node_id"`
			Data   *PriceData `json:"data"`
		}
		
		if err := json.NewDecoder(r.Body).Decode(&submission); err != nil {
			http.Error(w, "Invalid JSON", http.StatusBadRequest)
			return
		}
		
		if err := on.SubmitPrice(submission.NodeID, submission.Data); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "success"})
	})
	
	log.Printf("Oracle network HTTP server starting on port %s", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func (on *OracleNetwork) StartPriceFetcher(ctx context.Context) {
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()
	
	symbols := []string{"WETH", "WBTC", "USDC", "USDT"}
	
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			for _, symbol := range symbols {
				go on.fetchExternalPrice(symbol)
			}
		}
	}
}

func (on *OracleNetwork) fetchExternalPrice(symbol string) {
	// Mock external price fetching
	basePrice := map[string]int64{
		"WETH": 2000,
		"WBTC": 30000,
		"USDC": 1,
		"USDT": 1,
	}
	
	if base, exists := basePrice[symbol]; exists {
		// Add some random variation
		variation := int64(float64(base) * 0.02 * (2*time.Now().UnixNano()%100/100.0 - 1))
		price := big.NewInt(base + variation)
		price.Mul(price, big.NewInt(1e8)) // 8 decimals
		
		data := &PriceData{
			Symbol:    symbol,
			Price:     price,
			Timestamp: time.Now().Unix(),
			Source:    "external_fetcher",
			Signature: fmt.Sprintf("%x", sha256.Sum256([]byte(fmt.Sprintf("%s%s%d", symbol, price.String(), time.Now().Unix())))[:8]),
		}
		
		on.SubmitPrice("external_fetcher", data)
	}
}

func main() {
	network := NewOracleNetwork()
	
	// Register some nodes
	nodes := []*OracleNode{
		{ID: "node1", Address: "0x1...", Stake: big.NewInt(1000), Reputation: 100, Active: true},
		{ID: "node2", Address: "0x2...", Stake: big.NewInt(2000), Reputation: 150, Active: true},
		{ID: "node3", Address: "0x3...", Stake: big.NewInt(1500), Reputation: 120, Active: true},
		{ID: "external_fetcher", Address: "0x4...", Stake: big.NewInt(5000), Reputation: 200, Active: true},
	}
	
	for _, node := range nodes {
		network.RegisterNode(node)
	}
	
	ctx := context.Background()
	
	// Start price fetcher
	go network.StartPriceFetcher(ctx)
	
	// Start HTTP server
	go network.StartHTTPServer("8080")
	
	// Keep running
	select {}
}