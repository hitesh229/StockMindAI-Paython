-- Database schema definitions for StockMindAI
-- DBMS: MySQL / MariaDB

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    risk_appetite VARCHAR(50) DEFAULT 'Medium', -- Low, Medium, High
    investment_goals TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. PORTFOLIOS TABLE
CREATE TABLE IF NOT EXISTS portfolios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    shares DECIMAL(18, 4) NOT NULL,
    purchase_price DECIMAL(18, 4) NOT NULL,
    purchase_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_portfolios_user_id ON portfolios(user_id);
CREATE INDEX idx_portfolios_symbol ON portfolios(symbol);

-- 3. WATCHLISTS TABLE
CREATE TABLE IF NOT EXISTS watchlists (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, symbol),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_watchlists_user_id ON watchlists(user_id);

-- 4. STOCK_HISTORY TABLE (Cache for daily prices and technical indicators)
CREATE TABLE IF NOT EXISTS stock_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    date DATETIME NOT NULL,
    `close` DECIMAL(18, 4) NOT NULL,
    `open` DECIMAL(18, 4) NULL,
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
    UNIQUE(symbol, date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_stock_history_symbol_date ON stock_history(symbol, date);

-- 5. RECOMMENDATIONS TABLE
CREATE TABLE IF NOT EXISTS recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    recommendation VARCHAR(10) NOT NULL, -- BUY, HOLD, SELL
    confidence_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    technical_score DECIMAL(5, 2) NULL,
    sentiment_score DECIMAL(5, 2) NULL,
    explanation TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_recommendations_symbol ON recommendations(symbol);

-- 6. ALERTS TABLE
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    alert_type VARCHAR(50) NOT NULL, -- Sentiment, Breakout, Volatility, RSI
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_alerts_is_read ON alerts(is_read);

-- 7. NEWS_CACHE TABLE
CREATE TABLE IF NOT EXISTS news_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    title VARCHAR(500) NOT NULL,
    url TEXT NULL,
    published_at DATETIME NULL,
    sentiment VARCHAR(20) NULL, -- Positive, Negative, Neutral
    sentiment_score DECIMAL(5, 4) NULL,
    summary TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_news_cache_symbol ON news_cache(symbol);

-- 8. CHAT_HISTORY TABLE
CREATE TABLE IF NOT EXISTS chat_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    sender VARCHAR(10) NOT NULL, -- User, AI
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_chat_history_user_id ON chat_history(user_id);

-- 9. PREDICTIONS TABLE
CREATE TABLE IF NOT EXISTS predictions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    symbol VARCHAR(20) NOT NULL,
    target_date DATETIME NOT NULL,
    predicted_price DECIMAL(18, 4) NOT NULL,
    growth_probability DECIMAL(5, 2) NULL,
    risk_probability DECIMAL(5, 2) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_predictions_symbol ON predictions(symbol);

-- 10. RISK_REPORTS TABLE
CREATE TABLE IF NOT EXISTS risk_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    diversification_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    beta DECIMAL(5, 2) NULL,
    risk_level VARCHAR(50) NOT NULL, -- Low, Medium, High
    weak_stocks TEXT NULL, -- JSON array of weak assets
    sector_exposure TEXT NULL, -- JSON object of sector allocations
    health_score DECIMAL(5, 2) NOT NULL, -- 0.00 to 100.00
    recommendations TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_risk_reports_user_id ON risk_reports(user_id);
