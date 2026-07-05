-- InvestIQ MySQL Schema

CREATE DATABASE IF NOT EXISTS investiq;
USE investiq;

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url VARCHAR(255) DEFAULT NULL,
    is_verified TINYINT(1) NOT NULL DEFAULT 0,
    verification_token VARCHAR(255) DEFAULT NULL,
    reset_token VARCHAR(255) DEFAULT NULL,
    reset_token_expires DATETIME DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
-- User Settings Table
CREATE TABLE IF NOT EXISTS settings (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL UNIQUE,
    theme VARCHAR(20) DEFAULT 'dark',
    language VARCHAR(10) DEFAULT 'en',
    notifications_enabled TINYINT(1) DEFAULT 1,
    ai_model VARCHAR(50) DEFAULT 'gemini',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_settings_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Research History Table
CREATE TABLE IF NOT EXISTS research_history (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    status ENUM('pending','completed','failed') DEFAULT 'pending',
    response_time_ms INT DEFAULT 0,
    tokens_used INT DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_user_ticker (user_id, ticker),
    CONSTRAINT fk_history_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Investment Reports Table
CREATE TABLE IF NOT EXISTS investment_reports (
    id INT NOT NULL AUTO_INCREMENT,
    history_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    report_data LONGTEXT NOT NULL,
    investment_score INT NOT NULL,
    recommendation VARCHAR(20) NOT NULL,
    ai_summary TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_ticker (ticker),
    CONSTRAINT fk_report_history
        FOREIGN KEY (history_id)
        REFERENCES research_history(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_report_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Saved Reports Table
CREATE TABLE IF NOT EXISTS saved_reports (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    report_id INT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_report (user_id, report_id),
    CONSTRAINT fk_saved_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_saved_report
        FOREIGN KEY (report_id)
        REFERENCES investment_reports(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- Bookmarks Table
CREATE TABLE IF NOT EXISTS bookmarks (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    ticker VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY unique_user_bookmark (user_id, ticker),
    CONSTRAINT fk_bookmark_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read TINYINT(1) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_notification_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- API Logs Table
CREATE TABLE IF NOT EXISTS api_logs (
    id INT NOT NULL AUTO_INCREMENT,
    user_id INT DEFAULT NULL,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INT NOT NULL,
    response_time_ms INT NOT NULL,
    ip_address VARCHAR(45) DEFAULT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_api_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Company Data Cache Table
CREATE TABLE IF NOT EXISTS company_cache (
    ticker VARCHAR(20) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    cache_data LONGTEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    updated_at DATETIME DEFAULT NULL,
    PRIMARY KEY (ticker)
<<<<<<< HEAD
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
=======
) ENGINE=InnoDB DEFAULT CHARSET=utf8;
>>>>>>> 94888be (Update code)
