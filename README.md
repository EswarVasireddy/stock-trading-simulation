# Stock Trading Simulation System

A trading simulation platform with portfolio tracking and trade execution against a mock, continuously-moving market — no real brokerage or market data dependency required.

## Tech Stack

- Backend: Node.js, Express

## Features

- A small in-memory market of 6 instruments whose prices follow a random walk, ticked on a 2-second interval to feel live
- Per-user simulated portfolios starting with $100,000 cash
- Buy/sell trade execution with validation: rejects trades on insufficient cash, insufficient shares, or an unknown symbol
- Full trade history per user

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

    cd backend
    npm install
    npm start

The API runs on http://localhost:4000.

## Tests

    cd backend
    npm test

Covers portfolio creation, buy/sell execution, and the insufficient funds/shares error paths (5 tests).

## Project structure

    stock-trading-simulation/
    └── backend/
        ├── server.js         # Express app + routes
        ├── market.js         # Mock market data + price random walk
        ├── portfolio.js      # Portfolio store + trade execution logic
        └── tests/
            └── portfolio.test.js

## Status

Backend-only API for now — a React dashboard (live prices, portfolio view, trade form) is planned but not yet built. Every endpoint above is testable directly via curl or Postman; the trade execution engine (validated buy/sell, live-moving mock prices, per-user portfolios) is the core piece this repo demonstrates.
