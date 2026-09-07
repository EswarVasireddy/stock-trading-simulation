const express = require("express");
const cors = require("cors");
const { Market } = require("./market");
const {
  PortfolioStore,
  InsufficientFundsError,
  InsufficientSharesError,
  UnknownSymbolError,
} = require("./portfolio");

const app = express();
app.use(cors());
app.use(express.json());

const market = new Market();
const portfolios = new PortfolioStore(market);

// Tick the market every 2 seconds so prices move like a live feed.
const tickInterval = setInterval(() => market.tick(), 2000);
tickInterval.unref?.(); // don't keep the process alive just for the timer (helps tests)

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/stocks", (req, res) => {
  res.json({ instruments: market.list() });
});

app.get("/api/portfolio/:userId", (req, res) => {
  res.json(portfolios.getPortfolio(req.params.userId));
});

app.get("/api/portfolio/:userId/trades", (req, res) => {
  res.json({ trades: portfolios.getTrades(req.params.userId) });
});

app.post("/api/trade", (req, res) => {
  const { userId, symbol, side, qty } = req.body || {};

  if (!userId || !symbol || !side || qty === undefined) {
    return res.status(400).json({ error: "userId, symbol, side, and qty are required" });
  }

  try {
    const trade = portfolios.executeTrade(userId, symbol, side, Number(qty));
    return res.status(201).json({ trade, portfolio: portfolios.getPortfolio(userId) });
  } catch (err) {
    if (
      err instanceof InsufficientFundsError ||
      err instanceof InsufficientSharesError ||
      err instanceof UnknownSymbolError ||
      err instanceof RangeError
    ) {
      return res.status(400).json({ error: err.message });
    }
    console.error(err);
    return res.status(500).json({ error: "internal error" });
  }
});

if (require.main === module) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`Stock trading simulation API on :${PORT}`));
}

module.exports = { app, market, portfolios };
