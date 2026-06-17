import json

SECTOR_DATABASE = {
    "AAPL": "Technology",
    "MSFT": "Technology",
    "NVDA": "Technology",
    "GOOG": "Technology",
    "GOOGL": "Technology",
    "TCS": "Technology",
    "TCS.NS": "Technology",
    "INFY": "Technology",
    "INFY.NS": "Technology",
    "TSLA": "Consumer Cyclical",
    "AMZN": "Consumer Cyclical",
    "MRF": "Consumer Cyclical",
    "MRF.NS": "Consumer Cyclical",
    "JPM": "Financial Services",
    "BAC": "Financial Services",
    "HDFCBANK": "Financial Services",
    "HDFCBANK.NS": "Financial Services",
    "JNJ": "Healthcare",
    "UNH": "Healthcare",
    "RELIANCE": "Energy",
    "RELIANCE.NS": "Energy"
}

BETA_DATABASE = {
    "AAPL": 1.15,
    "MSFT": 1.15,
    "NVDA": 1.70,
    "GOOG": 1.10,
    "GOOGL": 1.10,
    "TCS": 0.75,
    "TCS.NS": 0.75,
    "INFY": 0.80,
    "INFY.NS": 0.80,
    "TSLA": 1.40,
    "AMZN": 1.40,
    "MRF": 0.90,
    "MRF.NS": 0.90,
    "JPM": 1.20,
    "BAC": 1.20,
    "HDFCBANK": 0.90,
    "HDFCBANK.NS": 0.90,
    "JNJ": 0.60,
    "UNH": 0.60,
    "RELIANCE": 0.85,
    "RELIANCE.NS": 0.85
}

class RiskEngine:
    def __init__(self):
        pass

    def get_stock_sector(self, symbol: str) -> str:
        return SECTOR_DATABASE.get(symbol.upper(), "Other")

    def get_stock_beta(self, symbol: str) -> float:
        return BETA_DATABASE.get(symbol.upper(), 1.0)

    def analyze_portfolio(self, holdings: list, stock_analyses: dict) -> dict:
        """
        Analyzes a list of user holdings.
        holdings format:
        [
          {"symbol": "AAPL", "shares": 10, "purchase_price": 150.0, "current_price": 180.0},
          {"symbol": "NVDA", "shares": 5, "purchase_price": 400.0, "current_price": 900.0}
        ]
        stock_analyses: Dict mapping symbol -> {'technical': technical_signals, 'sentiment': sentiment_data, 'prediction': prediction_data}
        """
        if not holdings:
            return {
                "diversification_score": 0.0,
                "beta": 1.0,
                "risk_level": "Low",
                "weak_stocks": [],
                "sector_exposure": {},
                "health_score": 0.0,
                "recommendations": "Add assets to begin portfolio health tracking."
            }

        total_value = 0.0
        portfolio_items = []
        
        # 1. Calculate values and fetch sector/beta
        for h in holdings:
            symbol = h["symbol"].upper()
            shares = float(h["shares"])
            purchase_price = float(h["purchase_price"])
            current_price = float(h.get("current_price", purchase_price))
            
            value = shares * current_price
            total_value += value
            
            sector = self.get_stock_sector(symbol)
            beta = self.get_stock_beta(symbol)
            
            portfolio_items.append({
                "symbol": symbol,
                "shares": shares,
                "purchase_price": purchase_price,
                "current_price": current_price,
                "value": value,
                "sector": sector,
                "beta": beta
            })

        if total_value == 0:
            total_value = 1.0 # avoid division by zero

        # 2. Calculate Sector Exposure & Weighted Beta
        sector_weights = {}
        weighted_beta = 0.0

        for item in portfolio_items:
            weight = item["value"] / total_value
            item["weight"] = weight
            weighted_beta += item["beta"] * weight
            
            sector = item["sector"]
            sector_weights[sector] = sector_weights.get(sector, 0.0) + (weight * 100)

        # Round sector weights
        for s in sector_weights:
            sector_weights[s] = round(sector_weights[s], 2)

        # 3. Calculate Diversification Score (0 to 100)
        # Factors: Number of assets, and Herfindahl-Hirschman Index (HHI) for sector concentration
        num_assets = len(portfolio_items)
        asset_score = min(100.0, num_assets * 15.0) # 7+ assets gets full asset score

        # HHI is the sum of squared sector weights (percent)
        # A portfolio concentrated entirely in 1 sector has HHI = 100^2 = 10000
        # A well-diversified has HHI close to 1500-2000
        hhi = sum(w**2 for w in sector_weights.values())
        hhi_score = max(0.0, 100.0 - (hhi - 2000) / 80.0) if hhi > 2000 else 100.0
        
        diversification_score = round((asset_score * 0.4) + (hhi_score * 0.6), 2)

        # 4. Identify Weak Stocks
        # Weak stocks have: bearish technicals (score < 40), negative news sentiment (score < -0.3), or high prediction risk (> 30%)
        weak_stocks = []
        for item in portfolio_items:
            symbol = item["symbol"]
            analysis = stock_analyses.get(symbol, {})
            
            is_weak = False
            reasons = []
            
            if analysis:
                tech_score = analysis.get("technical", {}).get("score", 50)
                sent_score = analysis.get("sentiment", {}).get("score", 0.0)
                risk_prob = analysis.get("prediction", {}).get("risk_probability", 0.0)

                if tech_score < 40:
                    is_weak = True
                    reasons.append("Bearish technical indicators")
                if sent_score < -0.2:
                    is_weak = True
                    reasons.append("Negative news sentiment")
                if risk_prob > 35:
                    is_weak = True
                    reasons.append("High future volatility/downside risk")

            if is_weak:
                weak_stocks.append({
                    "symbol": symbol,
                    "reasons": reasons
                })

        # 5. Risk Classification based on weighted beta
        if weighted_beta < 0.75:
            risk_level = "Low (Conservative)"
        elif weighted_beta > 1.25:
            risk_level = "High (Aggressive)"
        else:
            risk_level = "Medium (Balanced)"

        # 6. Overall Portfolio Health Score (0 to 100)
        # Weighted combination: Diversification (40%), Volatility risk (weighted beta close to 1.0 is healthy, 30%), underperforming weak stock count (30%)
        beta_health = max(0.0, 100.0 - abs(weighted_beta - 1.0) * 100.0) # ideal beta is 1.0
        weak_penalty = max(0.0, 100.0 - len(weak_stocks) * 20.0)
        
        health_score = round((diversification_score * 0.4) + (beta_health * 0.3) + (weak_penalty * 0.3), 2)

        # 7. Generate Intelligent AI Action Recommendations
        advices = []
        if diversification_score < 50:
            advices.append("- **Increase asset diversification**: Your portfolio is concentrated in too few stocks. Consider expanding to at least 5 different tickers.")
        
        # Check sector concentration
        max_sector = max(sector_weights.items(), key=lambda x: x[1]) if sector_weights else ("", 0)
        if max_sector[1] > 40:
            advices.append(f"- **High Sector Concentration**: You have too much exposure in **{max_sector[0]}** ({max_sector[1]:.1f}%). Rebalance by investing in Defensive sectors like Healthcare or Consumer Defensives.")

        if weighted_beta > 1.3:
            advices.append(f"- **High Volatility Exposure**: Your weighted portfolio beta is {weighted_beta:.2f}, indicating it is 30%+ more volatile than the S&P 500. Consider adding utility stocks or bonds to stabilize.")
        elif weighted_beta < 0.5:
            advices.append(f"- **Conservative Stagnation**: Your weighted beta is very low ({weighted_beta:.2f}). While safe, you might miss out on market bull runs. Consider allocating a small percentage to growth equities.")

        if weak_stocks:
            weak_syms = ", ".join([w["symbol"] for w in weak_stocks])
            advices.append(f"- **Underperforming Assets**: We detected negative signals for: **{weak_syms}**. Consider swapping them for higher-rated equities.")

        if not advices:
            advices.append("- Your portfolio health is in excellent standing! Maintain your active allocation and monitor for any sudden news sentiment shifts.")

        recommendations = "\n".join(advices)

        return {
            "diversification_score": float(diversification_score),
            "beta": float(round(weighted_beta, 2)),
            "risk_level": risk_level,
            "weak_stocks": weak_stocks,
            "sector_exposure": sector_weights,
            "health_score": float(health_score),
            "recommendations": recommendations
        }
