-- ======================================================
-- Database: AI-Do / Wedding Planner (PostgreSQL version)
-- Author: Joey Wagner
-- ======================================================

CREATE DATABASE aido_db;
\c aido_db;

-- ===================== USERS =====================
CREATE TABLE Users (
    userId SERIAL PRIMARY KEY,
    firstName VARCHAR(100) NOT NULL,
    lastName VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    totalBudget DECIMAL(12,2) DEFAULT 0.00
);

-- ===================== BUDGET ITEMS =====================
CREATE TABLE BudgetItems (
    budgetId SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(userId) ON DELETE CASCADE,
    budgetItemName VARCHAR(45) NOT NULL,
    allottedFunds DECIMAL(12,2) DEFAULT 0.00,
    color VARCHAR(45),
    paymentStatus BOOLEAN DEFAULT FALSE
);

-- ===================== EVENT TYPES =====================
CREATE TABLE EventTypes (
    typeCode SERIAL PRIMARY KEY,
    type VARCHAR(100) NOT NULL
);

-- ===================== EVENTS =====================
CREATE TABLE Events (
    eventId SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(userId) ON DELETE CASCADE,
    eventTitle VARCHAR(100) NOT NULL,
    startTime TIMESTAMP,
    endTime TIMESTAMP,
    eventDescription TEXT,
    eventTypeCode INT REFERENCES EventTypes(typeCode)
);

-- ===================== CHATS =====================
CREATE TABLE Chats (
    chatId SERIAL PRIMARY KEY,
    userId INT NOT NULL REFERENCES Users(userId) ON DELETE CASCADE,
    chatTitle VARCHAR(100),
    archived BOOLEAN DEFAULT FALSE,
    chatType SMALLINT DEFAULT 0
);

-- ===================== MESSAGES =====================
CREATE TABLE Messages (
    messageId SERIAL PRIMARY KEY,
    chatId INT NOT NULL REFERENCES Chats(chatId) ON DELETE CASCADE,
    question TEXT,
    answer TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
