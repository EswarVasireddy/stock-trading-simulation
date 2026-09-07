/**
 * In-memory mock market data: a small fixed universe of instruments whose
 * prices follow a simple random walk, ticked on an interval so the
 * simulation feels "live" without depending on any external market data
 * provider or API key.
 */

const INSTRUMENTS = [
  { symbol: "ACME", name: "Acme Corp", price: 142.5 },
  { symbol: "GLOBEX", name: "Globex Industries", price: 88.2 },
  { symbol: "INITECH", name: "Initech Ltd", price: 54.75 },
  { symbol: "UMBRELLA", name: "Umbrella Holdings", price: 210.1 },
  { symbol: "SOYLENT", name: "Soylent Foods", price: 19.4 },
  { symbol: "HOOLI", name: "Hooli Inc", price: 305.6 },
];

class Market {
  constructor(instruments = INSTRUMENTS) {
    this.instruments = new Map(
      instruments.map((i) => [i.symbol, { ...i }])
    );
  }

  tick() {
    for (const instrument of this.instruments.values()) {
      // Random walk: +/- up to 1.5% per tick, floored so prices stay positive.
      const changePct = (Math.random() - 0.5) * 0.03;
      instrument.price = Math.max(0.5, +(instrument.price * (1 + changePct)).toFixed(2));
    }
  }

  list() {
    return [...this.instruments.values()];
  }

  getPrice(symbol) {
    const instrument = this.instruments.get(symbol);
    return instrument ? instrument.price : null;
  }

  exists(symbol) {
    return this.instruments.has(symbol);
  }
}

module.exports = { Market, INSTRUMENTS };
