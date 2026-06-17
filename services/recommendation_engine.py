class RecommendationEngine:
    """
    Engine to synthesize technical signals, sentiment metrics, and predictions
    into a unified BUY/HOLD/SELL recommendation with a confidence score.
    """
    def __init__(self):
        pass

    def generate_recommendation(self, technical_signals: dict, sentiment_data: dict, prediction_data: dict, risk_profile: str = "Medium") -> dict:
        """
        Synthesizes indicators into a single score.
        risk_profile: "Low", "Medium", "High" (adjusts sensitivity to bearish indicators)
        """
        tech_score = technical_signals.get("score", 50) # 0 to 100
        # Convert sentiment score (-1.0 to 1.0) into a 0 to 100 scale
        raw_sentiment = sentiment_data.get("score", 0.0)
        sentiment_score = int(50 + (raw_sentiment * 50))
        
        # Prediction score (based on growth probability)
        pred_score = prediction_data.get("growth_probability", 50.0)

        # Factor weights
        # Technical analysis: 40%
        # Sentiment: 40%
        # Prediction: 20%
        weighted_score = (tech_score * 0.40) + (sentiment_score * 0.40) + (pred_score * 0.20)

        # Adjust score thresholds based on user risk appetite
        # Low risk users require stronger bullish signals to BUY, and trigger SELL easier
        # High risk users are more willing to BUY on momentum and tolerant of minor bearishness
        buy_threshold = 60
        sell_threshold = 40

        if risk_profile == "Low":
            buy_threshold = 65
            sell_threshold = 45
        elif risk_profile == "High":
            buy_threshold = 55
            sell_threshold = 35

        # Classify final recommendation
        if weighted_score >= buy_threshold:
            recommendation = "BUY"
            # Scale confidence relative to the distance from threshold
            confidence = int(50 + (weighted_score - buy_threshold) * (50 / (100 - buy_threshold)))
        elif weighted_score <= sell_threshold:
            recommendation = "SELL"
            confidence = int(50 + (sell_threshold - weighted_score) * (50 / sell_threshold))
        else:
            recommendation = "HOLD"
            # Confidence is highest at 50% score (perfect neutral)
            distance_from_center = abs(weighted_score - 50)
            confidence = int(100 - (distance_from_center * 2))

        confidence = max(10, min(100, confidence)) # clamp between 10% and 100%

        # Generate structural bullet-point reasoning
        bullets = []

        # 1. Technical signal reasoning
        tech_rating = technical_signals.get("rating", "HOLD")
        bullets.append(f"Technical indicators are currently **{tech_rating}** (Score: {tech_score}/100).")
        for reason in technical_signals.get("reasons", [])[:2]:
            bullets.append(f"- {reason}")

        # 2. Sentiment signal reasoning
        sentiment_label = sentiment_data.get("sentiment", "Neutral")
        bullets.append(f"AI News Sentiment is **{sentiment_label}** (Score: {sentiment_score}/100).")
        if sentiment_data.get("reason"):
            bullets.append(f"- {sentiment_data['reason']}")

        # 3. Forecast reasoning
        trend = prediction_data.get("trend", "SIDEWAYS")
        growth_prob = prediction_data.get("growth_probability", 50.0)
        risk_prob = prediction_data.get("risk_probability", 15.0)
        bullets.append(f"Predictive engine forecasts a **{trend}** trend with a **{growth_prob}%** growth probability and a **{risk_prob}%** downside risk probability.")

        explanation = "\n".join(bullets)

        return {
            "recommendation": recommendation,
            "confidence_score": confidence,
            "technical_score": tech_score,
            "sentiment_score": sentiment_score,
            "prediction_score": pred_score,
            "overall_score": weighted_score,
            "explanation": explanation
        }
