import torch
import torch.nn as nn
import numpy as np
from transformers import AutoTokenizer, AutoModel
import re
import json
from typing import Dict, List, Tuple

class VulnerabilityDetector(nn.Module):
    def __init__(self, vocab_size=10000, embed_dim=256, hidden_dim=512):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim)
        self.lstm = nn.LSTM(embed_dim, hidden_dim, batch_first=True, bidirectional=True)
        self.attention = nn.MultiheadAttention(hidden_dim * 2, 8)
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, 256),
            nn.ReLU(),
            nn.Dropout(0.3),
            nn.Linear(256, 64),
            nn.ReLU(),
            nn.Linear(64, 10)  # 10 vulnerability types
        )
    
    def forward(self, x):
        embedded = self.embedding(x)
        lstm_out, _ = self.lstm(embedded)
        attn_out, _ = self.attention(lstm_out, lstm_out, lstm_out)
        pooled = torch.mean(attn_out, dim=1)
        return self.classifier(pooled)

class SmartContractAuditor:
    def __init__(self):
        self.model = VulnerabilityDetector()
        self.tokenizer = AutoTokenizer.from_pretrained('microsoft/codebert-base')
        self.vulnerability_types = [
            'reentrancy', 'integer_overflow', 'access_control', 
            'unchecked_call', 'timestamp_dependence', 'tx_origin',
            'uninitialized_storage', 'delegatecall', 'randomness', 'dos'
        ]
    
    def preprocess_contract(self, contract_code: str) -> List[int]:
        # Remove comments and normalize
        code = re.sub(r'//.*?\n|/\*.*?\*/', '', contract_code, flags=re.DOTALL)
        code = re.sub(r'\s+', ' ', code).strip()
        
        # Tokenize
        tokens = self.tokenizer.encode(code, max_length=512, truncation=True)
        return tokens
    
    def detect_vulnerabilities(self, contract_code: str) -> Dict:
        tokens = self.preprocess_contract(contract_code)
        input_tensor = torch.tensor([tokens])
        
        with torch.no_grad():
            predictions = self.model(input_tensor)
            probabilities = torch.softmax(predictions, dim=1)[0]
        
        results = {}
        for i, vuln_type in enumerate(self.vulnerability_types):
            confidence = float(probabilities[i])
            if confidence > 0.5:
                results[vuln_type] = {
                    'confidence': confidence,
                    'severity': self._get_severity(vuln_type, confidence)
                }
        
        return results
    
    def _get_severity(self, vuln_type: str, confidence: float) -> str:
        high_risk = ['reentrancy', 'integer_overflow', 'access_control']
        if vuln_type in high_risk and confidence > 0.8:
            return 'CRITICAL'
        elif confidence > 0.7:
            return 'HIGH'
        elif confidence > 0.6:
            return 'MEDIUM'
        return 'LOW'
    
    def generate_report(self, vulnerabilities: Dict, contract_address: str) -> str:
        report = f"# Security Audit Report\n\n"
        report += f"**Contract:** {contract_address}\n"
        report += f"**Scan Date:** {np.datetime64('now')}\n\n"
        
        if not vulnerabilities:
            report += "✅ No vulnerabilities detected.\n"
            return report
        
        report += "## Vulnerabilities Found\n\n"
        for vuln_type, details in vulnerabilities.items():
            report += f"### {vuln_type.upper()}\n"
            report += f"- **Severity:** {details['severity']}\n"
            report += f"- **Confidence:** {details['confidence']:.2%}\n"
            report += f"- **Recommendation:** {self._get_recommendation(vuln_type)}\n\n"
        
        return report
    
    def _get_recommendation(self, vuln_type: str) -> str:
        recommendations = {
            'reentrancy': 'Use ReentrancyGuard or checks-effects-interactions pattern',
            'integer_overflow': 'Use SafeMath library or Solidity 0.8+',
            'access_control': 'Implement proper access control modifiers',
            'unchecked_call': 'Always check return values of external calls',
            'timestamp_dependence': 'Avoid using block.timestamp for critical logic'
        }
        return recommendations.get(vuln_type, 'Review code carefully')

# Usage example
if __name__ == "__main__":
    auditor = SmartContractAuditor()
    
    sample_contract = """
    pragma solidity ^0.8.0;
    contract Vulnerable {
        mapping(address => uint) balances;
        
        function withdraw() public {
            uint amount = balances[msg.sender];
            msg.sender.call{value: amount}("");
            balances[msg.sender] = 0;
        }
    }
    """
    
    vulnerabilities = auditor.detect_vulnerabilities(sample_contract)
    report = auditor.generate_report(vulnerabilities, "0x123...")
    print(report)
// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced

// Logging enhanced
