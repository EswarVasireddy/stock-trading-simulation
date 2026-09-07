/**
 * In-memory portfolio store: tracks cash and holdings per simulated user,
 * and executes buy/sell trades against a Market's current prices.
 */

const STARTING_CASH = 100000;

class InsufficientFundsError extends Error {}
class InsufficientSharesError extends Error {}
class UnknownSymbolError extends Error {}

class PortfolioStore {
  constructor(market) {
    this.market = market;
    this.portfolios = new Map(); // userId -> { cash, holdings: Map(symbol -> qty) }
    this.trades = []; // trade history, newest last
  }

  _getOrCreate(userId) {
    if (!this.portfolios.has(userId)) {
      this.portfolios.set(userId, { cash: STARTING_CASH, holdings: new Map() });
    }
    return this.portfolios.get(userId);
  }

  getPortfolio(userId) {
    const p = this._getOrCreate(userId);
    const holdings = [...p.holdings.entries()]
      .filter(([, qty]) => qty > 0)
      .map(([symbol, qty]) => {
        const price = this.market.getPrice(symbol) ?? 0;
        return { symbol, qty, price, value: +(qty * price).toFixed(2) };
      });

    const holdingsValue = holdings.reduce((sum, h) => sum + h.value, 0);

    return {
      userId,
      cash: +p.cash.toFixed(2),
      holdings,
      holdingsValue: +holdingsValue.toFixed(2),
      netWorth: +(p.cash + holdingsValue).toFixed(2),
    };
  }

  executeTrade(userId, symbol, side, qty) {
    if (!Number.isInteger(qty) || qty <= 0) {
      throw new RangeError("qty must be a positive integer");
    }
    if (!this.market.exists(symbol)) {
      throw new UnknownSymbolError(`unknown symbol '${symbol}'`);
    }

    const p = this._getOrCreate(userId);
    const price = this.market.getPrice(symbol);
    const cost = +(price * qty).toFixed(2);

    if (side === "buy") {
      if (cost > p.cash) {
        throw new InsufficientFundsError(
          `insufficient cash: need ${cost}, have ${p.cash.toFixed(2)}`
        );
      }
      p.cash = +(p.cash - cost).toFixed(2);
      p.holdings.set(symbol, (p.holdings.get(symbol) || 0) + qty);
    } else if (side === "sell") {
      const held = p.holdings.get(symbol) || 0;
      if (qty > held) {
        throw new InsufficientSharesError(
          `insufficient shares: trying to sell ${qty}, hold ${held}`
        );
      }
      p.holdings.set(symbol, held - qty);
      p.cash = +(p.cash + cost).toFixed(2);
    } else {
      throw new RangeError("side must be 'buy' or 'sell'");
    }

    const trade = {
      id: this.trades.length + 1,
      userId,
      symbol,
      side,
      qty,
      price,
      total: cost,
      timestamp: new Date().toISOString(),
    };
    this.trades.push(trade);
    return trade;
  }

  getTrades(userId) {
    return this.trades.filter((t) => t.userId === userId);
  }
}

module.exports = {
  PortfolioStore,
  STARTING_CASH,
  InsufficientFundsError,
  InsufficientSharesError,
  UnknownSymbolError,
};
