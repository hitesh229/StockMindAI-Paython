import yfinance as yf

symbol = "SPY"
ticker = yf.Ticker(symbol)
df = ticker.history(period="1y")
print("DF Empty:", df.empty)
if not df.empty:
    print("Latest close price:", df['Close'].iloc[-1])
else:
    print("Failed to fetch SPY! Ticker info:", ticker.info)
