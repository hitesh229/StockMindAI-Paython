import os
import json
import requests
from utils.api_keys import get_api_keys

# Try importing transformers and torch for local FinBERT
HAS_TRANSFORMERS = False
try:
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    import torch
    HAS_TRANSFORMERS = True
except ImportError:
    pass

class FinBERTModel:
    def __init__(self):
        self.model_name = "ProsusAI/finbert"
        self.tokenizer = None
        self.model = None
        self.initialized = False
        
        # Try initializing local model if transformers available and allowed
        if HAS_TRANSFORMERS:
            try:
                # We use a lazy loader to not block startup
                pass
            except Exception as e:
                print(f"Lazy init prepared, local load failed: {e}")

    def _lazy_init(self):
        if not self.initialized and HAS_TRANSFORMERS:
            try:
                print("Initializing local FinBERT model...")
                self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
                self.model = AutoModelForSequenceClassification.from_pretrained(self.model_name)
                self.initialized = True
                print("Local FinBERT loaded successfully.")
            except Exception as e:
                print(f"Failed to load local FinBERT, will fallback to LLM: {e}")

    def analyze_sentiment_local(self, text: str) -> dict:
        """
        Uses local FinBERT weights to analyze sentiment.
        """
        self._lazy_init()
        if not self.initialized:
            raise RuntimeError("Local model not initialized")

        inputs = self.tokenizer(text, padding=True, truncation=True, max_length=512, return_tensors="pt")
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
        
        # FinBERT labels: 0 -> Positive, 1 -> Negative, 2 -> Neutral
        probs = predictions[0].tolist()
        labels = ["Positive", "Negative", "Neutral"]
        
        max_idx = probs.index(max(probs))
        sentiment = labels[max_idx]
        
        # Compound score between -1.0 and 1.0
        # Positive = +1, Negative = -1, Neutral = 0
        score = probs[0] - probs[1]

        return {
            "sentiment": sentiment,
            "score": score,
            "probabilities": {
                "positive": probs[0],
                "negative": probs[1],
                "neutral": probs[2]
            },
            "method": "local_finbert"
        }

    def analyze_sentiment_llm(self, text: str) -> dict:
        """
        Fallback using LLM (Groq or OpenRouter) to evaluate text sentiment.
        This provides high accuracy, reasoning explanation, and requires no local resources.
        """
        keys = get_api_keys()
        api_key = keys["groq"]
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "llama3-8b-8192"

        if not api_key:
            # Try OpenRouter
            api_key = keys["openrouter"]
            url = "https://openrouter.ai/api/v1/chat/completions"
            model = "meta-llama/llama-3-8b-instruct:free"

        if not api_key:
            # Ultimate mock fallback
            return self._mock_sentiment(text)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        prompt = f"""
Analyze the financial sentiment of this news headline/article.
Respond ONLY with a valid JSON object matching this schema:
{{
  "sentiment": "Positive" | "Negative" | "Neutral",
  "score": <float between -1.0 and 1.0, where 1.0 is highly positive, -1.0 is highly negative, 0.0 is neutral>,
  "reason": "<one sentence explanation of why this news is positive/negative/neutral for the related stock>"
}}

Text to analyze:
"{text}"
"""

        try:
            payload = {
                "model": model,
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"}
            }
            response = requests.post(url, headers=headers, json=payload, timeout=8)
            res_data = response.json()
            
            content = res_data["choices"][0]["message"]["content"]
            result = json.loads(content)
            
            return {
                "sentiment": result.get("sentiment", "Neutral"),
                "score": float(result.get("score", 0.0)),
                "reason": result.get("reason", "Neutral sentiment detected."),
                "method": "llm_fallback"
            }
        except Exception as e:
            print(f"LLM Sentiment analysis failed: {e}")
            return self._mock_sentiment(text)

    def _mock_sentiment(self, text: str) -> dict:
        text_lower = text.lower()
        
        # Very simple heuristic keywords
        pos_words = ["gain", "rise", "grow", "profit", "beat", "surge", "up", "bullish", "higher", "record", "exceed"]
        neg_words = ["loss", "fall", "drop", "decline", "warn", "miss", "plunge", "down", "bearish", "lower", "weak", "cut"]

        pos_count = sum(1 for w in pos_words if w in text_lower)
        neg_count = sum(1 for w in neg_words if w in text_lower)

        if pos_count > neg_count:
            return {
                "sentiment": "Positive",
                "score": 0.65,
                "reason": "Text contains positive keywords.",
                "method": "heuristic_mock"
            }
        elif neg_count > pos_count:
            return {
                "sentiment": "Negative",
                "score": -0.65,
                "reason": "Text contains negative keywords.",
                "method": "heuristic_mock"
            }
        else:
            return {
                "sentiment": "Neutral",
                "score": 0.0,
                "reason": "Text contains balanced or no strong sentiment keywords.",
                "method": "heuristic_mock"
            }

    def analyze(self, text: str) -> dict:
        """
        Public analyze method: tries local FinBERT, falls back to LLM, then heuristic.
        """
        if HAS_TRANSFORMERS:
            try:
                return self.analyze_sentiment_local(text)
            except Exception as e:
                print(f"Local sentiment analysis failed, falling back to LLM: {e}")
        
        return self.analyze_sentiment_llm(text)
