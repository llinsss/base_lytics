package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"math/big"
	"sort"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type Chain struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	RPC      string `json:"rpc"`
	Explorer string `json:"explorer"`
}

type DEX struct {
	Name     string `json:"name"`
	Chain    int    `json:"chain"`
	Router   string `json:"router"`
	Factory  string `json:"factory"`
	Fee      int    `json:"fee"`
}

type Quote struct {
	DEX          string     `json:"dex"`
	Chain        int        `json:"chain"`
	AmountIn     *big.Int   `json:"amount_in"`
	AmountOut    *big.Int   `json:"amount_out"`
	Price        float64    `json:"price"`
	Gas          *big.Int   `json:"gas"`
	Slippage     float64    `json:"slippage"`
	Route        []string   `json:"route"`
	Timestamp    time.Time  `json:"timestamp"`
}

type LiquidityAggregator struct {
	chains    map[int]Chain
	dexes     map[string]DEX
	quotes    map[string][]Quote
	mu        sync.RWMutex
	wsClients map[string]*websocket.Conn
}

func NewLiquidityAggregator() *LiquidityAggregator {
	return &LiquidityAggregator{
		chains:    make(map[int]Chain),
		dexes:     make(map[string]DEX),
		quotes:    make(map[string][]Quote),
		wsClients: make(map[string]*websocket.Conn),
	}
}

func (la *LiquidityAggregator) AddChain(chain Chain) {
	la.mu.Lock()
	defer la.mu.Unlock()
	la.chains[chain.ID] = chain
}

func (la *LiquidityAggregator) AddDEX(dex DEX) {
	la.mu.Lock()
	defer la.mu.Unlock()
	la.dexes[dex.Name] = dex
}

func (la *LiquidityAggregator) GetBestQuote(tokenIn, tokenOut string, amountIn *big.Int) (*Quote, error) {
	la.mu.RLock()
	defer la.mu.RUnlock()
	
	pair := fmt.Sprintf("%s-%s", tokenIn, tokenOut)
	quotes, exists := la.quotes[pair]
	if !exists || len(quotes) == 0 {
		return nil, fmt.Errorf("no quotes available for pair %s", pair)
	}
	
	// Sort by amount out (descending)
	sort.Slice(quotes, func(i, j int) bool {
		return quotes[i].AmountOut.Cmp(quotes[j].AmountOut) > 0
	})
	
	// Filter out stale quotes (older than 30 seconds)
	now := time.Now()
	for i, quote := range quotes {
		if now.Sub(quote.Timestamp) > 30*time.Second {
			quotes = quotes[:i]
			break
		}
	}
	
	if len(quotes) == 0 {
		return nil, fmt.Errorf("no fresh quotes available")
	}
	
	return &quotes[0], nil
}

func (la *LiquidityAggregator) FetchQuotes(ctx context.Context, tokenIn, tokenOut string, amountIn *big.Int) {
	var wg sync.WaitGroup
	quoteChan := make(chan Quote, len(la.dexes))
	
	for _, dex := range la.dexes {
		wg.Add(1)
		go func(d DEX) {
			defer wg.Done()
			quote, err := la.fetchQuoteFromDEX(ctx, d, tokenIn, tokenOut, amountIn)
			if err != nil {
				log.Printf("Error fetching quote from %s: %v", d.Name, err)
				return
			}
			quoteChan <- *quote
		}(dex)
	}
	
	go func() {
		wg.Wait()
		close(quoteChan)
	}()
	
	var quotes []Quote
	for quote := range quoteChan {
		quotes = append(quotes, quote)
	}
	
	pair := fmt.Sprintf("%s-%s", tokenIn, tokenOut)
	la.mu.Lock()
	la.quotes[pair] = quotes
	la.mu.Unlock()
	
	// Broadcast to WebSocket clients
	la.broadcastQuotes(pair, quotes)
}

func (la *LiquidityAggregator) fetchQuoteFromDEX(ctx context.Context, dex DEX, tokenIn, tokenOut string, amountIn *big.Int) (*Quote, error) {
	// Simulate DEX API call
	time.Sleep(time.Duration(100+dex.Chain*50) * time.Millisecond)
	
	// Mock calculation
	amountOut := new(big.Int).Mul(amountIn, big.NewInt(95))
	amountOut.Div(amountOut, big.NewInt(100))
	
	price := float64(amountOut.Int64()) / float64(amountIn.Int64())
	
	return &Quote{
		DEX:       dex.Name,
		Chain:     dex.Chain,
		AmountIn:  amountIn,
		AmountOut: amountOut,
		Price:     price,
		Gas:       big.NewInt(150000),
		Slippage:  0.5,
		Route:     []string{tokenIn, tokenOut},
		Timestamp: time.Now(),
	}, nil
}

func (la *LiquidityAggregator) OptimalRoute(tokenIn, tokenOut string, amountIn *big.Int, maxHops int) ([]Quote, error) {
	// Implement multi-hop routing algorithm
	bestRoute := make([]Quote, 0)
	
	// Direct route
	directQuote, err := la.GetBestQuote(tokenIn, tokenOut, amountIn)
	if err == nil {
		bestRoute = append(bestRoute, *directQuote)
	}
	
	// Multi-hop routes (simplified)
	if maxHops > 1 {
		intermediateTokens := []string{"USDC", "WETH", "USDT"}
		
		for _, intermediate := range intermediateTokens {
			if intermediate == tokenIn || intermediate == tokenOut {
				continue
			}
			
			// First hop
			quote1, err1 := la.GetBestQuote(tokenIn, intermediate, amountIn)
			if err1 != nil {
				continue
			}
			
			// Second hop
			quote2, err2 := la.GetBestQuote(intermediate, tokenOut, quote1.AmountOut)
			if err2 != nil {
				continue
			}
			
			// Compare with direct route
			if len(bestRoute) == 0 || quote2.AmountOut.Cmp(bestRoute[len(bestRoute)-1].AmountOut) > 0 {
				bestRoute = []Quote{*quote1, *quote2}
			}
		}
	}
	
	return bestRoute, nil
}

func (la *LiquidityAggregator) DetectMEV(quotes []Quote) bool {
	if len(quotes) < 2 {
		return false
	}
	
	// Check for significant price differences
	maxPrice := quotes[0].Price
	minPrice := quotes[0].Price
	
	for _, quote := range quotes[1:] {
		if quote.Price > maxPrice {
			maxPrice = quote.Price
		}
		if quote.Price < minPrice {
			minPrice = quote.Price
		}
	}
	
	// If price difference > 5%, potential MEV opportunity
	priceDiff := (maxPrice - minPrice) / minPrice
	return priceDiff > 0.05
}

func (la *LiquidityAggregator) broadcastQuotes(pair string, quotes []Quote) {
	message, _ := json.Marshal(map[string]interface{}{
		"type":   "quotes_update",
		"pair":   pair,
		"quotes": quotes,
	})
	
	for clientID, conn := range la.wsClients {
		err := conn.WriteMessage(websocket.TextMessage, message)
		if err != nil {
			log.Printf("Error broadcasting to client %s: %v", clientID, err)
			conn.Close()
			delete(la.wsClients, clientID)
		}
	}
}

func (la *LiquidityAggregator) StartPriceFeeds(ctx context.Context) {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()
	
	pairs := []struct{ tokenIn, tokenOut string }{
		{"WETH", "USDC"},
		{"WBTC", "WETH"},
		{"USDC", "USDT"},
	}
	
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			for _, pair := range pairs {
				amountIn := big.NewInt(1000000) // 1 token with 6 decimals
				go la.FetchQuotes(ctx, pair.tokenIn, pair.tokenOut, amountIn)
			}
		}
	}
}

func main() {
	aggregator := NewLiquidityAggregator()
	
	// Add chains
	aggregator.AddChain(Chain{ID: 1, Name: "Ethereum", RPC: "https://eth.llamarpc.com"})
	aggregator.AddChain(Chain{ID: 137, Name: "Polygon", RPC: "https://polygon.llamarpc.com"})
	aggregator.AddChain(Chain{ID: 56, Name: "BSC", RPC: "https://bsc.llamarpc.com"})
	
	// Add DEXes
	aggregator.AddDEX(DEX{Name: "Uniswap", Chain: 1, Router: "0x...", Fee: 30})
	aggregator.AddDEX(DEX{Name: "SushiSwap", Chain: 1, Router: "0x...", Fee: 30})
	aggregator.AddDEX(DEX{Name: "QuickSwap", Chain: 137, Router: "0x...", Fee: 30})
	
	ctx := context.Background()
	go aggregator.StartPriceFeeds(ctx)
	
	// Example usage
	time.Sleep(2 * time.Second)
	amountIn := big.NewInt(1000000)
	quote, err := aggregator.GetBestQuote("WETH", "USDC", amountIn)
	if err != nil {
		log.Printf("Error: %v", err)
	} else {
		fmt.Printf("Best quote: %+v\n", quote)
	}
	
	select {}
}