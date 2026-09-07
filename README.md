# Stock Trading Simulation System

A trading simulation platform with portfolio tracking and trade execution against a mock, continuously-moving market — no real brokerage or market data dependency required.

## Tech Stack

- Backend: Node.js, Express
- Frontend: React, Vite

## Features

- A small in-memory market of 6 instruments whose prices follow a random walk, ticked on a 2-second interval to feel live
- Per-user simulated portfolios starting with $100,000 cash
- Buy/sell trade execution with validation: rejects trades on insufficient cash, insufficient shares, or an unknown symbol
- Full trade history per user
- React dashboard showing live prices, portfolio value, holdings, and a trade form, polling the API every 2 seconds

## API

| Method | Endpoint | Description |
|---|---|---|
| GET | /api/health | Liveness check |
| GET | /api/stocks | Current prices for all instruments |
| GET | /api/portfolio/:userId | Cash, holdings, and net worth for a user |
| GET | /api/portfolio/:userId/trades | Trade history for a user |
| POST | /api/trade | Execute a trade: { userId, symbol, side, qty } |

Example request:

    curl -X POST localhost:4000/api/trade \
      -H "Content-Type: application/json" \
      -d '{"userId":"demo","symbol":"ACME","side":"buy","qty":10}'

## Running locally

### Backend

    cd backend
    npm install
    npm start

The API runs on http://localhost:4000.

### Frontend

    cd frontend
    npm install
    npm run dev

The dev server runs on http://localhost:5173 and proxies /api requests to the backend (see vite.config.js).

## Tests

    cd backend
    npm test

Covers portfolio creation, buy/sell execution, and the insufficient funds/shares error paths (5 tests).

## Project structure

    stock-trading-simulation/
    ├── backend/
    │   ├── server.js         # Express app + routes
    │   ├── market.js         # Mock market data + price random walk
    │   ├── portfolio.js      # Portfolio store + trade execution logic
    │   └── tests/
    │       └── portfolio.test.js
    └── frontend/
        ├── index.html
        ├── vite.config.js
        └── src/
            ├── main.jsx
            ├── App.jsx        # Dashboard: prices, holdings, trade form, history
            └── App.css

## Status

Full stack and working end to end: the Express API (validated buy/sell, live-moving mock prices, per-user portfolios) is backed by a React dashboard that polls prices and portfolio state every 2 seconds and lets you submit trades directly from the browser.
