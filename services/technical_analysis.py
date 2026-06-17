import pandas as pd
import numpy as np

def calculate_technical_indicators(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes technical indicators: RSI, MACD, SMA, EMA, and Bollinger Bands
    Input: df with 'Close', 'High', 'Low', 'Open', 'Volume' columns
    Output: df with indicators appended
    """
    if len(df) < 50:
        # If there aren't enough data points, fill with empty values
        df['RSI'] = 50.0
        df['MACD'] = 0.0
        df['MACD_Signal'] = 0.0
        df['MACD_Hist'] = 0.0
        df['SMA_50'] = df['Close']
        df['SMA_200'] = df['Close']
        df['BB_Middle'] = df['Close']
        df['BB_Upper'] = df['Close']
        df['BB_Lower'] = df['Close']
        return df

    close = df['Close']

    # 1. SMA and EMA
    df['SMA_50'] = close.rolling(window=50, min_periods=1).mean()
    df['SMA_200'] = close.rolling(window=200, min_periods=1).mean()
    df['EMA_12'] = close.ewm(span=12, adjust=False).mean()
    df['EMA_26'] = close.ewm(span=26, adjust=False).mean()

    # 2. RSI (14 days)
    delta = close.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=14, min_periods=1).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=14, min_periods=1).mean()
    rs = gain / (loss + 1e-10) # avoid division by zero
    df['RSI'] = 100 - (100 / (1 + rs))
    df['RSI'] = df['RSI'].fillna(50.0) # fallback for neutral

    # 3. MACD (12, 26, 9)
    df['MACD'] = df['EMA_12'] - df['EMA_26']
    df['MACD_Signal'] = df['MACD'].ewm(span=9, adjust=False).mean()
    df['MACD_Hist'] = df['MACD'] - df['MACD_Signal']

    # 4. Bollinger Bands (20 days, 2 standard deviations)
    df['BB_Middle'] = close.rolling(window=20, min_periods=1).mean()
    std_dev = close.rolling(window=20, min_periods=1).std()
    df['BB_Upper'] = df['BB_Middle'] + (2 * std_dev)
    df['BB_Lower'] = df['BB_Middle'] - (2 * std_dev)
    df['BB_Upper'] = df['BB_Upper'].fillna(df['Close'])
    df['BB_Lower'] = df['BB_Lower'].fillna(df['Close'])

    return df

def generate_technical_signals(df: pd.DataFrame) -> dict:
    """
    Analyzes the latest technical indicators and generates a summary and rating.
    """
    if df.empty:
        return {"rating": "HOLD", "score": 50, "summary": "No stock data available."}

    latest = df.iloc[-1]
    prev = df.iloc[-2] if len(df) > 1 else latest

    close = float(latest['Close'])
    rsi = float(latest['RSI'])
    macd = float(latest['MACD'])
    macd_sig = float(latest['MACD_Signal'])
    bb_upper = float(latest['BB_Upper'])
    bb_lower = float(latest['BB_Lower'])
    sma_50 = float(latest['SMA_50'])
    sma_200 = float(latest['SMA_200'])

    bullish_signals = 0
    bearish_signals = 0
    total_signals = 0

    reasons = []

    # RSI Signals
    total_signals += 1
    if rsi < 30:
        bullish_signals += 1
        reasons.append("RSI is oversold (< 30), suggesting a potential upward breakout.")
    elif rsi > 70:
        bearish_signals += 1
        reasons.append("RSI is overbought (> 70), indicating the stock might be overvalued.")
    else:
        reasons.append(f"RSI is neutral at {rsi:.2f}.")

    # MACD Crossover
    total_signals += 1
    if macd > macd_sig and prev['MACD'] <= prev['MACD_Signal']:
        bullish_signals += 1
        reasons.append("MACD line crossed above the signal line (Bullish Crossover).")
    elif macd < macd_sig and prev['MACD'] >= prev['MACD_Signal']:
        bearish_signals += 1
        reasons.append("MACD line crossed below the signal line (Bearish Crossover).")
    else:
        status = "bullish" if macd > macd_sig else "bearish"
        reasons.append(f"MACD momentum is currently {status}.")

    # Moving Average Crossovers (Golden Cross / Death Cross)
    total_signals += 1
    if sma_50 > sma_200:
        bullish_signals += 1
        if prev['SMA_50'] <= prev['SMA_200']:
            reasons.append("Golden Cross detected: 50-day SMA crossed above the 200-day SMA!")
        else:
            reasons.append("SMA_50 is above SMA_200 (Long-term bullish trend).")
    else:
        bearish_signals += 1
        if prev['SMA_50'] >= prev['SMA_200']:
            reasons.append("Death Cross detected: 50-day SMA crossed below the 200-day SMA!")
        else:
            reasons.append("SMA_50 is below SMA_200 (Long-term bearish trend).")

    # Bollinger Bands breakout
    total_signals += 1
    if close < bb_lower:
        bullish_signals += 1
        reasons.append("Price fell below the lower Bollinger Band, suggesting an oversold price dip.")
    elif close > bb_upper:
        bearish_signals += 1
        reasons.append("Price broke out above the upper Bollinger Band, showing strong bullish volatility or overextension.")
    else:
        reasons.append("Price is trading within the Bollinger Bands.")

    # Calculate Score (0 to 100)
    # Neutral is 50. Bullish moves score up to 100, Bearish moves down to 0.
    if total_signals > 0:
        score = int(50 + (bullish_signals - bearish_signals) * (50 / total_signals))
    else:
        score = 50

    if score > 60:
        rating = "BUY"
    elif score < 40:
        rating = "SELL"
    else:
        rating = "HOLD"

    return {
        "rating": rating,
        "score": score,
        "rsi": rsi,
        "macd": macd,
        "macd_signal": macd_sig,
        "bb_upper": bb_upper,
        "bb_lower": bb_lower,
        "sma_50": sma_50,
        "sma_200": sma_200,
        "reasons": reasons
    }
