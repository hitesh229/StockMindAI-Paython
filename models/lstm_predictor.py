import numpy as np
import pandas as pd

class LSTMPredictor:
    """
    Scientific forecasting model.
    Combines historical price trend extrapolation, exponential momentum,
    and Monte Carlo random walk simulations to estimate future prices,
    growth probability, and risk probability.
    """
    def __init__(self, forecast_days: int = 7):
        self.forecast_days = forecast_days

    def predict(self, df: pd.DataFrame) -> dict:
        """
        Takes historical price DataFrame.
        Returns:
            - predicted_prices: list of floats for the next N days
            - growth_probability: percentage chance of positive return
            - risk_probability: percentage chance of significant downside (>3% drop)
            - trend: "BULLISH" | "BEARISH" | "SIDEWAYS"
        """
        if df.empty or len(df) < 10:
            # Mock fallback if not enough data
            return {
                "predicted_prices": [],
                "growth_probability": 50.0,
                "risk_probability": 15.0,
                "trend": "SIDEWAYS"
            }

        prices = df['Close'].values
        n = len(prices)

        # 1. Calculate Daily Returns
        returns = np.diff(prices) / prices[:-1]
        mean_return = np.mean(returns)
        std_return = np.std(returns) if np.std(returns) > 0 else 0.01

        # 2. Extrapolate Trend (using Linear Regression on the last 30 days)
        window = min(30, n)
        x = np.arange(window)
        y = prices[-window:]
        slope, intercept = np.polyfit(x, y, 1)

        # 3. Calculate Exponential Moving Average momentum
        ema_short = df['Close'].ewm(span=5).mean().iloc[-1]
        ema_long = df['Close'].ewm(span=20).mean().iloc[-1]
        momentum_factor = (ema_short - ema_long) / ema_long

        # 4. Generate Future Forecast (Hybrid Regression + Volatility drift)
        last_price = prices[-1]
        predicted_prices = []
        
        current_price = last_price
        for i in range(1, self.forecast_days + 1):
            # Extrapolated change from regression + momentum
            regression_change = slope * 0.5 # dampened
            momentum_change = current_price * momentum_factor * 0.1
            
            # Combine trend components
            expected_change = regression_change + momentum_change
            
            # Update price (ensure it doesn't go below zero)
            current_price = max(1.0, current_price + expected_change)
            predicted_prices.append(round(float(current_price), 2))

        # 5. Monte Carlo Simulation to calculate probabilities
        # We simulate 1000 random walks for the forecast window
        num_simulations = 1000
        simulated_endpoints = []

        for _ in range(num_simulations):
            sim_price = last_price
            for _ in range(self.forecast_days):
                # Random shock based on historical mean return and standard deviation
                random_shock = np.random.normal(mean_return, std_return)
                sim_price *= (1 + random_shock)
            simulated_endpoints.append(sim_price)

        simulated_endpoints = np.array(simulated_endpoints)

        # Growth Probability: Chance that final price is higher than last_price
        growth_count = np.sum(simulated_endpoints > last_price)
        growth_probability = round(float((growth_count / num_simulations) * 100), 2)

        # Risk Probability: Chance of a significant drop (>3% downside)
        risk_threshold = last_price * 0.97
        risk_count = np.sum(simulated_endpoints < risk_threshold)
        risk_probability = round(float((risk_count / num_simulations) * 100), 2)

        # Determine Trend direction
        price_diff_percent = (predicted_prices[-1] - last_price) / last_price
        if price_diff_percent > 0.015:
            trend = "BULLISH"
        elif price_diff_percent < -0.015:
            trend = "BEARISH"
        else:
            trend = "SIDEWAYS"

        return {
            "predicted_prices": predicted_prices,
            "growth_probability": growth_probability,
            "risk_probability": risk_probability,
            "trend": trend
        }
