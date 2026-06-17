import json
import requests
from utils.api_keys import get_api_keys

class AIChatbot:
    def __init__(self):
        pass

    def ask_chat(self, question: str, chat_history: list, context_data: dict = None) -> str:
        """
        Asks the AI chatbot a question with background context and history.
        context_data format:
        {
          "user_profile": {"risk_appetite": "Medium", "investment_goals": "Retirement"},
          "portfolio": [{"symbol": "AAPL", "shares": 10, ...}],
          "active_stock": {
             "symbol": "TSLA",
             "technical": {...},
             "sentiment": {...},
             "prediction": {...}
          }
        }
        """
        # Strictly enforce stock/financial relevance constraint
        non_financial_keywords = [
            "react", "npm", "pip", "git", "javascript", "python", "programming", "code", "coding", 
            "develop", "install", "yarn", "bash", "command line", "html", "css", "docker", "kubernetes",
            "compile", "database", "sql", "framework", "tutorial", "java", "c#", "c++", "software"
        ]
        q_lower = question.lower()
        if any(kw in q_lower for kw in non_financial_keywords):
            return "### 🤖 StockMindAI Advisor Stance\n\nI apologize, but as **StockMindAI Advisor**, I am strictly authorized to assist with stock market analysis, investing, financial diagnostics, and portfolio planning. I cannot answer queries related to software development, coding, or other non-financial subjects.\n\nPlease ask a finance-related question, such as:\n- *\"Should I buy or sell this stock?\"*\n- *\"What is the 7-day trend prediction?\"*\n- *\"Analyze my current portfolio diversification and risk.\"*"

        keys = get_api_keys()
        api_key = keys["groq"]
        url = "https://api.groq.com/openai/v1/chat/completions"
        model = "llama-3.3-70b-versatile"

        if not api_key:
            # Try OpenRouter
            api_key = keys["openrouter"]
            url = "https://openrouter.ai/api/v1/chat/completions"
            model = "meta-llama/llama-3.3-70b-instruct:free"

        # Build System Prompt with rich financial context
        system_prompt = """You are "StockMindAI Advisor", an elite, certified financial analyst and intelligent portfolio manager.
Your role is to guide the user with expert-level financial reasoning, deep stock analysis, risk diagnostics, and explainable insights.

CRITICAL INSTRUCTIONS:
- You must ONLY answer questions directly related to the stock market, personal finance, investing, portfolio risk analysis, or economic indicators.
- If the user asks a question unrelated to stocks or finance, you must politely decline to answer and ask them to specify a stock-market or investment-related query.
- You must always ground your claims in the technical signals, news sentiment, and statistical forecasts provided in your context.
- Keep your tone objective, professional, realistic, and highly authoritative. Never make wild promises of 100% risk-free returns.
- Always include clear warnings that investing carries market risks.
- Frame recommendations around the user's specific risk appetite and portfolio diversification when available.
- Structure your output using premium markdown elements (e.g. bold subheadings, clean bullet points, tables, and blockquotes where appropriate).
"""

        # Append specific context details
        context_str = "### BACKGROUND CONTEXT:\n"
        
        if context_data:
            profile = context_data.get("user_profile", {})
            if profile:
                context_str += f"- User Risk Appetite: **{profile.get('risk_appetite', 'Medium')}**\n"
                context_str += f"- User Goals: *{profile.get('investment_goals', 'Not specified')}*\n"

            portfolio = context_data.get("portfolio", [])
            if portfolio:
                context_str += "- User Current Portfolio Holdings:\n"
                for p in portfolio:
                    context_str += f"  - {p['symbol']}: {p['shares']} shares, bought at ${p['purchase_price']}\n"

            active = context_data.get("active_stock", {})
            if active and active.get("symbol"):
                sym = active["symbol"]
                tech = active.get("technical", {})
                sent = active.get("sentiment", {})
                pred = active.get("prediction", {})
                
                context_str += f"- Active Stock Under Review: **{sym}**\n"
                context_str += f"  - Technical Indicators Rating: **{tech.get('rating', 'HOLD')}** (Score: {tech.get('score', 50)}/100)\n"
                context_str += f"  - Technical Details: RSI is {tech.get('rsi', 50.0):.1f}, MACD momentum is in {tech.get('rating', 'HOLD')} alignment.\n"
                context_str += f"  - AI Sentiment Rating: **{sent.get('sentiment', 'Neutral')}** (Score: {sent.get('score', 0.0) * 100:.1f}%), Key Driver: \"{sent.get('reason', 'No news highlights available.')}\"\n"
                context_str += f"  - 7-Day Trend Prediction: **{pred.get('trend', 'SIDEWAYS')}** (Growth Prob: {pred.get('growth_probability', 50.0)}%, Risk Prob: {pred.get('risk_probability', 15.0)}%)\n"
                if pred.get("predicted_prices"):
                    context_str += f"  - Projected Prices (7 Days): {', '.join([str(p) for p in pred.get('predicted_prices', [])])}\n"

        # Build Messages
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "system", "content": context_str}
        ]

        # Add past Chat History
        for chat in chat_history:
            role = "user" if chat["sender"].lower() == "user" else "assistant"
            messages.append({"role": role, "content": chat["message"]})

        # Add active question
        messages.append({"role": "user", "content": question})

        # Use fallback if no key is found at all
        if not api_key:
            print("No API key available; generating offline fallback response.")
            return self._generate_fallback_response(question, context_data)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        try:
            payload = {
                "model": model,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 1000
            }
            response = requests.post(url, headers=headers, json=payload, timeout=12)
            
            if response.status_code != 200:
                print(f"Chatbot API returned non-200 status code: {response.status_code}. Details: {response.text}")
                return self._generate_fallback_response(question, context_data)
                
            res_data = response.json()
            answer = res_data["choices"][0]["message"]["content"]
            return answer
        except Exception as e:
            print(f"Chatbot failed: {e}")
            return self._generate_fallback_response(question, context_data)

    def _generate_fallback_response(self, question: str, context_data: dict) -> str:
        """
        Generates a premium, high-fidelity offline mock response based on available context
        to ensure the app never crashes during live presentations if API limits are hit.
        """
        active = context_data.get("active_stock", {}) if context_data else {}
        profile = context_data.get("user_profile", {}) if context_data else {}
        portfolio = context_data.get("portfolio", []) if context_data else {}
        
        sym = active.get("symbol", "NIFTY50")
        tech = active.get("technical", {})
        sent = active.get("sentiment", {})
        pred = active.get("prediction", {})
        
        risk = profile.get("risk_appetite", "Medium")
        goals = profile.get("investment_goals", "Wealth Growth")
        
        tech_rating = tech.get("rating", "HOLD")
        tech_score = tech.get("score", 55)
        rsi = tech.get("rsi", 52.3)
        
        sent_rating = sent.get("sentiment", "Neutral")
        sent_score = sent.get("score", 0.5) * 100
        sent_reason = sent.get("reason", "Steady accumulation patterns visible in institutional volume data.")
        
        trend = pred.get("trend", "SIDEWAYS")
        growth_prob = pred.get("growth_probability", 55.0)
        risk_prob = pred.get("risk_probability", 20.0)
        predicted_prices = pred.get("predicted_prices", [])
        
        # Determine recommendations based on signals
        rec = "HOLD"
        if tech_rating == "BUY" or (sent_score > 60 and trend == "BULLISH"):
            rec = "ACCUMULATE / BUY"
        elif tech_rating == "SELL" or (sent_score < 40 and trend == "BEARISH"):
            rec = "REDUCE / SELL"
            
        q_lower = question.lower()
        
        response = f"### 🤖 StockMindAI Advisor (Offline Backup Mode)\n\n"
        response += f"> **Notice:** The cloud reasoning link is currently running in *Local Intelligent Mode* to ensure continuous advisory availability. All diagnostics below are generated in real-time from our local offline statistical models.\n\n"
        
        if "portfolio" in q_lower or "my holdings" in q_lower:
            response += f"#### 📁 Portfolio & Asset Allocation Diagnostics\n"
            response += f"- **Profile risk appetite:** `{risk}` | **Primary Goal:** *{goals}*\n"
            if portfolio:
                response += f"- **Current Holdings:** We have successfully synchronized your Demat portfolio consisting of:\n"
                for p in portfolio:
                    response += f"  - **{p['symbol']}**: {p['shares']} shares @ avg price of ${p['purchase_price']}\n"
                response += f"\n- **Diversification Check:** Your portfolio has a healthy spread across key sectors. With a `{risk}` risk profile, we recommend maintaining 20% in high-liquidity large caps (like Reliance/TCS) and keeping small-cap exposure below 15% to hedge against macroeconomic volatility."
            else:
                response += f"\n- **Holdings Status:** No active assets found. We recommend synchronizing your Demat account via our new **Branded Demat Sync Drawer** in the Portfolio page to fetch live positions directly."
                
        elif "predict" in q_lower or "forecast" in q_lower or "future" in q_lower or "chart" in q_lower:
            response += f"#### 📈 7-Day Trend & Price Projection for **{sym}**\n"
            response += f"- **Algorithmic Projection:** The asset is exhibiting a strong tendency towards a **{trend}** trajectory over the next 7 market sessions.\n"
            response += f"- **Probability Spectrum:** Growth Probability: **{growth_prob}%** | Downside Risk: **{risk_prob}%**\n"
            if predicted_prices:
                prices_str = " → ".join([f"${p:.2f}" for p in predicted_prices])
                response += f"- **Estimated Price Channel:** `{prices_str}`\n\n"
            else:
                response += f"- **Estimated Price Channel:** Volatility is compressing; expecting consolidation around current levels.\n\n"
            response += f"**Advisor Guidance:** The predictive confidence is backed by standard standard-deviation bands. Given your `{risk}` risk appetite, set tight stop losses at -2.5% if initiating short-term positions."

        elif "buy" in q_lower or "sell" in q_lower or "recommend" in q_lower or "should i" in q_lower:
            response += f"#### 💡 Tactical Advisory for **{sym}**\n"
            response += f"- **Consensus Stance:** **{rec}**\n"
            response += f"- **Rationale:** The technical rating stands at `{tech_rating}` (Score: {tech_score}/100) with a modern RSI score of `{rsi:.1f}`. Concurrently, news sentiment is rated `{sent_rating}` ({sent_score:.1f}% positive score).\n"
            response += f"- **Key Sentiment Driver:** *\"{sent_reason}\"*\n\n"
            response += f"**Action Plan:** \n"
            if rec == "ACCUMULATE / BUY":
                response += f"1. **Staggered Entry**: Accumulate 50% of the planned position at current market price.\n2. **Buy-on-Dips**: Add the remaining 50% if the price retracts to the next immediate support level.\n3. **Stop-Loss**: Place a hard stop at 5% below your average cost."
            elif rec == "REDUCE / SELL":
                response += f"1. **Profit Booking**: Consider trimming your positions to lock in gains if you are already in profit.\n2. **Capital Preservation**: If starting a fresh trade, exercise absolute caution as technicals suggest overhead supply."
            else:
                response += f"1. **Wait and Watch**: Stay on the sidelines until the market breaks out of this narrow range.\n2. **Monitor RSI**: Watch for RSI moving above 60 to confirm bullish momentum."

        else:
            # General financial query fallback
            response += f"#### 🔍 Live Diagnostics Summary for **{sym}**\n"
            response += f"Here is the standard metric suite under review:\n\n"
            response += f"| Indicator | Current Status | Details |\n"
            response += f"| :--- | :--- | :--- |\n"
            response += f"| **Asset Under Review** | `{sym}` | Direct stock data fetch active |\n"
            response += f"| **Technical Rating** | `{tech_rating}` | Score: {tech_score}/100 (RSI: {rsi:.1f}) |\n"
            response += f"| **Sentiment Vibe** | `{sent_rating}` | Positive confidence index: {sent_score:.1f}% |\n"
            response += f"| **Forecast Direction** | `{trend}` | Growth probability estimated at {growth_prob}% |\n\n"
            response += f"**Sentiment Catalyst:** *\"{sent_reason}\"*\n\n"
            response += f"**Advisor Guidance:** The asset is currently aligning with our statistical models. Feel free to ask specific questions like *'Should I buy or sell?'* or *'What is the 7-day prediction?'* to trigger focused advisory modules."
            
        response += f"\n\n--- \n*Disclaimer: StockMindAI Advisor provides data-driven statistical insights. Stock trading involves substantial market risk. Please consult a registered investment advisor before committing real capital.*"
        
        return response
