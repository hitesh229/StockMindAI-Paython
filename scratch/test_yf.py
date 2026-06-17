import sys
sys.path.append("d:/Hitesh/MCA sem-4 Project/StockMindAI/ai-engine-python")
import main

class FakeRequest:
    def __init__(self, symbol, period="1y", risk_profile="Medium"):
        self.symbol = symbol
        self.period = period
        self.risk_profile = risk_profile

class FakeHoldingItem:
    def __init__(self, symbol, shares, purchase_price):
        self.symbol = symbol
        self.shares = shares
        self.purchase_price = purchase_price
    def dict(self):
        return {"symbol": self.symbol, "shares": self.shares, "purchase_price": self.purchase_price}

class FakePortfolioRiskRequest:
    def __init__(self, holdings, risk_profile="Medium"):
        self.holdings = holdings
        self.risk_profile = risk_profile

class FakeChatMessage:
    def __init__(self, sender, message):
        self.sender = sender
        self.message = message

class FakeChatRequest:
    def __init__(self, question, chat_history, active_symbol=None, risk_profile="Medium", portfolio=None):
        self.question = question
        self.chat_history = chat_history
        self.active_symbol = active_symbol
        self.risk_profile = risk_profile
        self.portfolio = portfolio

req = FakeRequest("MRF")

print("--- Testing analyze_technical ---")
try:
    res = main.analyze_technical(req)
    print("Success: symbol =", res.get("symbol"), ", price =", res.get("current_price"))
except Exception as e:
    import traceback
    traceback.print_exc()

print("--- Testing predict_stock ---")
try:
    res = main.predict_stock(req)
    print("Success: symbol =", res.get("symbol"), ", predictions =", list(res.keys()))
except Exception as e:
    import traceback
    traceback.print_exc()

print("--- Testing recommend_stock ---")
try:
    res = main.recommend_stock(req)
    print("Success: symbol =", res.get("symbol"), ", rating =", res.get("rating"))
except Exception as e:
    import traceback
    traceback.print_exc()

print("--- Testing analyze_portfolio_risk ---")
try:
    holdings = [FakeHoldingItem("MRF", 10.0, 100000.0)]
    req_risk = FakePortfolioRiskRequest(holdings)
    res = main.analyze_portfolio_risk(req_risk)
    print("Success: risk =", res.get("risk_score"))
except Exception as e:
    import traceback
    traceback.print_exc()

print("--- Testing chat_advisory ---")
try:
    req_chat = FakeChatRequest(
        question="Should I buy MRF?",
        chat_history=[FakeChatMessage("User", "Hello")],
        active_symbol="MRF",
        portfolio=[FakeHoldingItem("MRF", 10.0, 100000.0)]
    )
    res = main.chat_advisory(req_chat)
    print("Success: chat answer length =", len(res.get("answer", "")))
except Exception as e:
    import traceback
    traceback.print_exc()
