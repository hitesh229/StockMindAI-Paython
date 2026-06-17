-- Database schema definitions for StockMindAI
-- DBMS: Microsoft SQL Server (LocalDB / Express / Enterprise)

-- 1. USERS TABLE
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username NVARCHAR(100) UNIQUE NOT NULL,
    email NVARCHAR(255) UNIQUE NOT NULL,
    password_hash NVARCHAR(MAX) NOT NULL,
    risk_appetite NVARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High
    investment_goals NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. PORTFOLIOS TABLE
CREATE TABLE portfolios (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    symbol NVARCHAR(20) NOT NULL,
    shares DECIMAL(18, 4) NOT NULL,
    purchase_price DECIMAL(18, 4) NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_portfolios_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_symbol ON portfolios(symbol);

-- 3. WATCHLISTS TABLE
CREATE TABLE watchlists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    symbol NVARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT UQ_watchlists_user_symbol UNIQUE(user_id, symbol),
    CONSTRAINT FK_watchlists_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);

-- 4. STOCK_HISTORY TABLE (Cache for daily prices and technical indicators)
CREATE TABLE stock_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    date DATETIME NOT NULL,
    [close] DECIMAL(18, 4) NOT NULL,
    [open] DECIMAL(18, 4) NULL,
    high DECIMAL(18, 4) NULL,
    low DECIMAL(18, 4) NULL,
    volume BIGINT NULL,
    rsi DECIMAL(10, 4) NULL,
    macd DECIMAL(10, 4) NULL,
    macd_signal DECIMAL(10, 4) NULL,
    macd_hist DECIMAL(10, 4) NULL,
    sma_50 DECIMAL(18, 4) NULL,
    sma_200 DECIMAL(18, 4) NULL,
    bb_upper DECIMAL(18, 4) NULL,
    bb_lower DECIMAL(18, 4) NULL,
    bb_middle DECIMAL(18, 4) NULL,
    CONSTRAINT UQ_stock_history_symbol_date UNIQUE(symbol, date)
);

CREATE INDEX idx_stock_history_symbol_date ON stock_history(symbol, date);

-- 5. RECOMMENDATIONS TABLE
CREATE TABLE recommendations (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    recommendation NVARCHAR(10) NOT NULL, -- BUY, HOLD, SELL
    confidence_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    technical_score DECIMAL(5, 2) NULL,
    sentiment_score DECIMAL(5, 2) NULL,
    explanation NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_recommendations_symbol ON recommendations(symbol);

-- 6. ALERTS TABLE
CREATE TABLE alerts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    symbol NVARCHAR(20) NOT NULL,
    alert_type NVARCHAR(50) NOT NULL, -- Sentiment, Breakout, Volatility, RSI
    message NVARCHAR(MAX) NOT NULL,
    is_read BIT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_alerts_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- 7. NEWS_CACHE TABLE
CREATE TABLE news_cache (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    title NVARCHAR(500) NOT NULL,
    url NVARCHAR(MAX) NULL,
    published_at DATETIME NULL,
    sentiment NVARCHAR(20) NULL, -- Positive, Negative, Neutral
    sentiment_score DECIMAL(5, 4) NULL,
    summary NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_news_cache_symbol ON news_cache(symbol);

-- 8. CHAT_HISTORY TABLE
CREATE TABLE chat_history (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    sender NVARCHAR(10) NOT NULL, -- User, AI
    message NVARCHAR(MAX) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_chat_history_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);

-- 9. PREDICTIONS TABLE
CREATE TABLE predictions (
    id INT IDENTITY(1,1) PRIMARY KEY,
    symbol NVARCHAR(20) NOT NULL,
    target_date DATETIME NOT NULL,
    predicted_price DECIMAL(18, 4) NOT NULL,
    growth_probability DECIMAL(5, 2) NULL,
    risk_probability DECIMAL(5, 2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_predictions_symbol ON predictions(symbol);

-- 10. RISK_REPORTS TABLE
CREATE TABLE risk_reports (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    diversification_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    beta DECIMAL(5, 2) NULL,
    risk_level NVARCHAR(50) NOT NULL, -- Low, Medium, High
    weak_stocks NVARCHAR(MAX) NULL, -- JSON array of weak assets
    sector_exposure NVARCHAR(MAX) NULL, -- JSON object of sector allocations
    health_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    recommendations NVARCHAR(MAX) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT FK_risk_reports_users FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_risk_reports_user_id ON risk_reports(user_id);
