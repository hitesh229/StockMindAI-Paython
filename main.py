import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
import yfinance as yf
import pandas as pd

# Import our custom AI services
from services.technical_analysis import calculate_technical_indicators, generate_technical_signals
from models.finbert_model import FinBERTModel
from models.lstm_predictor import LSTMPredictor
from services.recommendation_engine import RecommendationEngine
from services.risk_engine import RiskEngine
from services.ai_chatbot import AIChatbot
from services.market_summary import MarketSummaryService

app = FastAPI(title="StockMindAI Python AI Engine", version="1.0.0")

# Enable CORS for communication from .NET and Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate models and services
sentiment_model = FinBERTModel()
lstm_predictor = LSTMPredictor(forecast_days=7)
recommendation_engine = RecommendationEngine()
risk_engine = RiskEngine()
chatbot = AIChatbot()
market_service = MarketSummaryService()

# Request/Response DTO models
class StockRequest(BaseModel):
    symbol: str
    period: Optional[str] = "1y" # 1d, 5d, 1mo, 3mo, 6mo, 1y, 5y

class NewsSentimentRequest(BaseModel):
    symbol: str
    headline: str

class RecommendationRequest(BaseModel):
    symbol: str
    risk_profile: Optional[str] = "Medium"

class HoldingItem(BaseModel):
    symbol: str
    shares: float
    purchase_price: float
    current_price: Optional[float] = 0.0

class PortfolioRiskRequest(BaseModel):
    holdings: List[HoldingItem]
    risk_profile: Optional[str] = "Medium"

class ChatMessage(BaseModel):
    sender: str # User or AI
    message: str

class ChatRequest(BaseModel):
    question: str
    chat_history: List[ChatMessage]
    active_symbol: Optional[str] = None
    risk_profile: Optional[str] = "Medium"
    portfolio: Optional[List[HoldingItem]] = None

@app.get("/")
def read_root():
    return {"status": "running", "service": "StockMindAI AI Engine"}

@app.get("/api/stock/search")
def search_stock(q: str):
    try:
        import requests
        import urllib.parse
        q = q.strip()
        if not q:
            return {"quotes": []}
        
        encoded_q = urllib.parse.quote(q)
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={encoded_q}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
        }
        response = requests.get(url, headers=headers, timeout=5)
        if response.status_code != 200:
            return {"quotes": []}
            
        data = response.json()
        quotes = data.get("quotes", [])
        
        suggestions = []
        for quote in quotes:
            symbol = quote.get("symbol")
            name = quote.get("shortname") or quote.get("longname") or symbol
            exch = quote.get("exchange")
            qtype = quote.get("quoteType")
            if symbol and name:
                suggestions.append({
                    "symbol": symbol,
                    "name": name,
                    "exchange": exch,
                    "type": qtype
                })
        return {"quotes": suggestions}
    except Exception as e:
        print(f"Search API error: {e}")
        return {"quotes": []}

def fetch_ticker_history(symbol: str, period: str = "1y") -> tuple:
    symbol = symbol.upper().strip()
    ticker = yf.Ticker(symbol)
    df = ticker.history(period=period)
    
    # Fallback to NSE Indian market (.NS) if search is empty and symbol doesn't contain a dot
    if df.empty and "." not in symbol:
        fallback_symbol = f"{symbol}.NS"
        ticker_fallback = yf.Ticker(fallback_symbol)
        df_fallback = ticker_fallback.history(period=period)
        if not df_fallback.empty:
            return ticker_fallback, df_fallback, fallback_symbol
            
    return ticker, df, symbol

@app.post("/api/analyze/technical")
def analyze_technical(request: StockRequest):
    try:
        ticker, df, resolved_symbol = fetch_ticker_history(request.symbol, request.period)
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No stock data found for symbol: {request.symbol.upper()}")
        
        # Reset index to get date column
        df = df.reset_index()
        df = calculate_technical_indicators(df)
        signals = generate_technical_signals(df)
        
        # Get historical prices with indicators for front-end charts
        history_list = []
        # Return last 100 days of data to limit payload size
        chart_df = df.tail(100)
        for _, row in chart_df.iterrows():
            history_list.append({
                "date": row['Date'].strftime('%Y-%m-%d') if hasattr(row['Date'], 'strftime') else str(row['Date']),
                "open": float(row['Open']),
                "high": float(row['High']),
                "low": float(row['Low']),
                "close": float(row['Close']),
                "volume": int(row['Volume']),
                "rsi": float(row.get('RSI', 50.0)),
                "macd": float(row.get('MACD', 0.0)),
                "macd_signal": float(row.get('MACD_Signal', 0.0)),
                "macd_hist": float(row.get('MACD_Hist', 0.0)),
                "sma_50": float(row.get('SMA_50', row['Close'])),
                "sma_200": float(row.get('SMA_200', row['Close'])),
                "bb_upper": float(row.get('BB_Upper', row['Close'])),
                "bb_lower": float(row.get('BB_Lower', row['Close'])),
                "bb_middle": float(row.get('BB_Middle', row['Close']))
            })
            
        return {
            "symbol": resolved_symbol,
            "current_price": float(df['Close'].iloc[-1]),
            "signals": signals,
            "history": history_list
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/analyze/sentiment")
def analyze_sentiment(request: NewsSentimentRequest):
    try:
        result = sentiment_model.analyze(request.headline)
        return {
            "symbol": request.symbol.upper(),
            "headline": request.headline,
            "sentiment": result["sentiment"],
            "score": result["score"],
            "reason": result.get("reason", "Analyzed via FinBERT pipeline."),
            "method": result.get("method", "local")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict")
def predict_stock(request: StockRequest):
    try:
        ticker, df, resolved_symbol = fetch_ticker_history(request.symbol, "1y")
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No stock data found for: {request.symbol.upper()}")
            
        predictions = lstm_predictor.predict(df)
        return {
            "symbol": resolved_symbol,
            **predictions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/recommend")
def recommend_stock(request: RecommendationRequest):
    try:
        ticker, df, resolved_symbol = fetch_ticker_history(request.symbol, "1y")
        if df.empty:
            raise HTTPException(status_code=404, detail=f"No stock data found for: {request.symbol.upper()}")
            
        # 1. Technical Indicators
        df_indicators = calculate_technical_indicators(df.reset_index())
        tech_signals = generate_technical_signals(df_indicators)
        
        # 2. Mock some news articles or pull real news highlights if yFinance has it
        news_list = ticker.news
        headline = f"{resolved_symbol} shares trade actively following quarterly operational update."
        if news_list and len(news_list) > 0:
            headline = news_list[0].get("title", headline)

        # 3. Sentiment Analysis
        sentiment = sentiment_model.analyze(headline)
        
        # 4. Predictions
        predictions = lstm_predictor.predict(df)
        
        # 5. Compile recommendation
        rec = recommendation_engine.generate_recommendation(
            tech_signals, sentiment, predictions, request.risk_profile
        )
        
        return {
            "symbol": resolved_symbol,
            "current_price": float(df['Close'].iloc[-1]),
            **rec
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/portfolio/risk")
def analyze_portfolio_risk(request: PortfolioRiskRequest):
    try:
        holdings_dicts = [h.dict() for h in request.holdings]
        
        # Retrieve analysis context for active holdings to evaluate strong/weak assets
        analyses = {}
        for h in holdings_dicts:
            symbol = h["symbol"].upper()
            try:
                ticker, df, resolved_symbol = fetch_ticker_history(symbol, "1mo")
                if not df.empty:
                    df_ind = calculate_technical_indicators(df.reset_index())
                    tech = generate_technical_signals(df_ind)
                    predictions = lstm_predictor.predict(df)
                    sentiment = {"sentiment": "Neutral", "score": 0.0, "reason": "Stable operations."}
                    
                    analyses[symbol] = {
                        "technical": tech,
                        "sentiment": sentiment,
                        "prediction": predictions
                    }
            except Exception:
                pass

        risk_report = risk_engine.analyze_portfolio(holdings_dicts, analyses)
        return risk_report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
def chat_advisory(request: ChatRequest):
    try:
        history_dicts = [{"sender": c.sender, "message": c.message} for c in request.chat_history]
        
        # Compile context for active symbol
        context = {
            "user_profile": {"risk_appetite": request.risk_profile},
            "portfolio": [p.dict() for p in request.portfolio] if request.portfolio else []
        }
        
        if request.active_symbol:
            try:
                ticker, df, resolved_symbol = fetch_ticker_history(request.active_symbol, "1y")
                if not df.empty:
                    # technicals
                    df_ind = calculate_technical_indicators(df.reset_index())
                    tech = generate_technical_signals(df_ind)
                    
                    # news
                    news_list = ticker.news
                    headline = f"{resolved_symbol} trades actively."
                    if news_list:
                        headline = news_list[0].get("title", headline)
                    sentiment = sentiment_model.analyze(headline)
                    
                    # prediction
                    predictions = lstm_predictor.predict(df)
                    
                    context["active_stock"] = {
                        "symbol": resolved_symbol,
                        "technical": tech,
                        "sentiment": sentiment,
                        "prediction": predictions
                    }
            except Exception as e:
                print(f"Failed loading chat active stock context: {e}")
                
        answer = chatbot.ask_chat(request.question, history_dicts, context)
        return {"answer": answer}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/market/summary")
def get_daily_market_summary():
    try:
        summary = market_service.get_market_summary()
        return summary
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
