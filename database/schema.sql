-- Database schema definitions for StockMindAI
-- DBMS: PostgreSQL

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    risk_appetite VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High
    investment_goals TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS portfolios (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    shares NUMERIC(18, 4) NOT NULL,
    purchase_price NUMERIC(18, 4) NOT NULL,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_symbol ON portfolios(symbol);

-- 3. WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS watchlists (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol)
);

CREATE INDEX IF NOT EXISTS idx_watchlists_user_id ON watchlists(user_id);

-- 4. STOCK_HISTORY TABLE (Cache for daily prices and technical indicators)
CREATE TABLE IF NOT EXISTS stock_history (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    "close" NUMERIC(18, 4) NOT NULL,
    "open" NUMERIC(18, 4) NULL,
    high NUMERIC(18, 4) NULL,
    low NUMERIC(18, 4) NULL,
    volume BIGINT NULL,
    rsi NUMERIC(10, 4) NULL,
    macd NUMERIC(10, 4) NULL,
    macd_signal NUMERIC(10, 4) NULL,
    macd_hist NUMERIC(10, 4) NULL,
    sma_50 NUMERIC(18, 4) NULL,
    sma_200 NUMERIC(18, 4) NULL,
    bb_upper NUMERIC(18, 4) NULL,
    bb_lower NUMERIC(18, 4) NULL,
    bb_middle NUMERIC(18, 4) NULL,
    UNIQUE(symbol, date)
);

CREATE INDEX IF NOT EXISTS idx_stock_history_symbol_date ON stock_history(symbol, date);

-- 5. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    recommendation VARCHAR(10) NOT NULL, -- BUY, HOLD, SELL
    confidence_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    technical_score NUMERIC(5, 2) NULL,
    sentiment_score NUMERIC(5, 2) NULL,
    explanation TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_recommendations_symbol ON recommendations(symbol);

-- 6. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- Sentiment, Breakout, Volatility, RSI
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);

-- 7. NEWS_CACHE TABLE
CREATE TABLE IF NOT EXISTS news_cache (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    url TEXT NULL,
    published_at TIMESTAMP WITH TIME ZONE NULL,
    sentiment VARCHAR(20) NULL, -- Positive, Negative, Neutral
    sentiment_score NUMERIC(5, 4) NULL,
    summary TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_news_cache_symbol ON news_cache(symbol);

-- 8. CHAT_HISTORY TABLE
CREATE TABLE IF NOT EXISTS chat_history (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    sender VARCHAR(10) NOT NULL, -- User, AI
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_history_user_id ON chat_history(user_id);

-- 9. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    id SERIAL PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    target_date TIMESTAMP WITH TIME ZONE NOT NULL,
    predicted_price NUMERIC(18, 4) NOT NULL,
    growth_probability NUMERIC(5, 2) NULL,
    risk_probability NUMERIC(5, 2) NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_predictions_symbol ON predictions(symbol);

-- 10. RISK_REPORTS TABLE
CREATE TABLE IF NOT EXISTS risk_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diversification_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    beta NUMERIC(5, 2) NULL,
    risk_level VARCHAR(50) NOT NULL, -- Low, Medium, High
    weak_stocks TEXT NULL, -- JSON array of weak assets
    sector_exposure TEXT NULL, -- JSON object of sector allocations
    health_score NUMERIC(5, 2) NOT NULL, -- 0.00 to 100.00
    recommendations TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_risk_reports_user_id ON risk_reports(user_id);
