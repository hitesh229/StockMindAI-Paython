import yfinance as yf
import pandas as pd
import numpy as np
import requests
from utils.api_keys import get_api_keys

class MarketSummaryService:
    def __init__(self):
        pass

    def get_market_summary(self) -> dict:
        """
        Fetches general indexes, computes a Fear & Greed index,
        and generates an AI overview.
        """
        # Major indexes
        tickers = {
            "S&P 500": "^GSPC",
            "Dow Jones": "^DJI",
            "Nasdaq": "^IXIC",
            "Volatility Index (VIX)": "^VIX"
        }

        indices_data = []
        spy_change = 0.0
        vix_value = 15.0

        for name, sym in tickers.items():
            try:
                t = yf.Ticker(sym)
                hist = t.history(period="5d")
                if not hist.empty:
                    latest = hist['Close'].iloc[-1]
                    prev = hist['Close'].iloc[-2]
                    change = float(((latest - prev) / prev) * 100)
                    indices_data.append({
                        "name": name,
                        "price": float(round(latest, 2)),
                        "change": float(round(change, 2))
                    })
                    if sym == "^GSPC":
                        spy_change = change
                    if sym == "^VIX":
                        vix_value = float(latest)
            except Exception as e:
                print(f"Failed to fetch {name}: {e}")
                # Mock if failed
                indices_data.append({
                    "name": name,
                    "price": 5000.0 if "S&P" in name else (39000.0 if "Dow" in name else (16000.0 if "Nasdaq" in name else 14.5)),
                    "change": 0.25
                })

        # Calculate Fear & Greed index (0 = Extreme Fear, 100 = Extreme Greed)
        # Factor 1: VIX value (VIX > 30 represents high fear, VIX < 12 represents extreme greed/complacency)
        # Factor 2: S&P 500 daily momentum
        # Base is 50. High VIX drives it down, low VIX drives it up. Positive SPY drives it up.
        vix_factor = max(0, min(100, 100 - (vix_value - 10) * 3)) # e.g. VIX=15 -> 100 - 15 = 85. VIX=30 -> 100 - 60 = 40.
        spy_factor = max(0, min(100, 50 + spy_change * 15))
        fear_greed_score = int((vix_factor * 0.5) + (spy_factor * 0.5))

        fear_greed_label = "Neutral"
        if fear_greed_score < 25:
            fear_greed_label = "Extreme Fear"
        elif fear_greed_score < 45:
            fear_greed_label = "Fear"
        elif fear_greed_score > 75:
            fear_greed_label = "Extreme Greed"
        elif fear_greed_score > 55:
            fear_greed_label = "Greed"

        # Sector tracker (mocking key indexes representing sectors or using ETFs)
        sector_etfs = {
            "Technology (XLK)": "XLK",
            "Financials (XLF)": "XLF",
            "Healthcare (XLV)": "XLV",
            "Energy (XLE)": "XLE",
            "Consumer Cyclical (XLY)": "XLY",
            "Consumer Defensive (XLP)": "XLP"
        }

        sectors = []
        for name, sym in sector_etfs.items():
            try:
                t = yf.Ticker(sym)
                hist = t.history(period="2d")
                if not hist.empty:
                    latest = hist['Close'].iloc[-1]
                    prev = hist['Close'].iloc[-2]
                    change = float(((latest - prev) / prev) * 100)
                    sectors.append({
                        "sector": name.split(" (")[0],
                        "change": float(round(change, 2))
                    })
            except Exception:
                sectors.append({
                    "sector": name.split(" (")[0],
                    "change": 0.12
                })

        # Generate intelligent summary using Groq/OpenRouter LLM
        keys = get_api_keys()
        api_key = keys["groq"]
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "llama3-8b-8192"

        if not api_key:
            api_key = keys["openrouter"]
            url = "https://openrouter.ai/api/v1/chat/completions"
            model = "meta-llama/llama-3-8b-instruct:free"

        ai_summary = "Markets are currently trading in a balanced range. High-tech momentum is stabilizing, while macroeconomic rate indicators continue to drive cautious trading behaviors. Monitor core index support thresholds."
        
        if api_key:
            headers = {
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json"
            }
            prompt = f"""
Write a premium, concise 3-sentence daily market summary.
Include S&P 500 status (daily change: {spy_change:.2f}%) and general VIX volatility status ({vix_value:.1f}).
Keep it highly analytical, objective, and realistic, like a brief from a Bloomberg editor.
"""
            try:
                payload = {
                    "model": model,
                    "messages": [{"role": "user", "content": prompt}],
                    "temperature": 0.3,
                    "max_tokens": 150
                }
                res = requests.post(url, headers=headers, json=payload, timeout=8)
                ai_summary = res.json()["choices"][0]["message"]["content"].strip()
            except Exception as e:
                print(f"Failed to generate market summary LLM: {e}")

        # Top Movers (Mock/Static major stock daily indicators)
        top_movers = [
            {"symbol": "NVDA", "name": "NVIDIA Corp.", "price": 932.50, "change": 3.42, "type": "gainer"},
            {"symbol": "TSLA", "name": "Tesla Inc.", "price": 174.60, "change": -2.15, "type": "loser"},
            {"symbol": "AAPL", "name": "Apple Inc.", "price": 182.30, "change": 0.85, "type": "gainer"},
            {"symbol": "MSFT", "name": "Microsoft Corp.", "price": 420.20, "change": -1.10, "type": "loser"}
        ]

        return {
            "indices": indices_data,
            "fear_greed_score": fear_greed_score,
            "fear_greed_label": fear_greed_label,
            "sectors": sectors,
            "summary": ai_summary,
            "top_movers": top_movers
        }
