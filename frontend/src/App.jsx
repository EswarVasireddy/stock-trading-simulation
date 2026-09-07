import { useEffect, useState, useCallback } from "react";

const POLL_MS = 2000;

async function fetchJson(url, options) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export default function App() {
  const [userId, setUserId] = useState("demo");
  const [stocks, setStocks] = useState([]);
  const [portfolio, setPortfolio] = useState(null);
  const [trades, setTrades] = useState([]);
  const [form, setForm] = useState({ symbol: "", side: "buy", qty: 1 });
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    try {
      const [stocksRes, portfolioRes, tradesRes] = await Promise.all([
        fetchJson("/api/stocks"),
        fetchJson(`/api/portfolio/${encodeURIComponent(userId)}`),
        fetchJson(`/api/portfolio/${encodeURIComponent(userId)}/trades`),
      ]);
      setStocks(stocksRes.instruments || []);
      setPortfolio(portfolioRes);
      setTrades((tradesRes.trades || []).slice().reverse());
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, POLL_MS);
    return () => clearInterval(id);
  }, [refresh]);

  useEffect(() => {
    if (!form.symbol && stocks.length > 0) {
      setForm((f) => ({ ...f, symbol: stocks[0].symbol }));
    }
  }, [stocks, form.symbol]);

  async function handleTrade(e) {
    e.preventDefault();
    setMessage(null);
    setError(null);
    try {
      const result = await fetchJson("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          symbol: form.symbol,
          side: form.side,
          qty: Number(form.qty),
        }),
      });
      setMessage(
        `${result.trade.side === "buy" ? "Bought" : "Sold"} ${result.trade.qty} ${
          result.trade.symbol
        } @ $${result.trade.price.toFixed(2)}`
      );
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="app">
      <header>
        <h1>Stock Trading Simulation</h1>
        <label className="user-picker">
          User ID:{" "}
          <input value={userId} onChange={(e) => setUserId(e.target.value || "demo")} />
        </label>
      </header>

      {error && <div className="banner banner-error">{error}</div>}
      {message && <div className="banner banner-ok">{message}</div>}

      <section className="summary">
        {portfolio && (
          <>
            <div className="stat">
              <span className="label">Cash</span>
              <span className="value">${portfolio.cash.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">Holdings value</span>
              <span className="value">${portfolio.holdingsValue.toFixed(2)}</span>
            </div>
            <div className="stat">
              <span className="label">Net worth</span>
              <span className="value">${portfolio.netWorth.toFixed(2)}</span>
            </div>
          </>
        )}
      </section>

      <div className="columns">
        <section className="panel">
          <h2>Live prices</h2>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Name</th>
                <th>Price</th>
              </tr>
            </thead>
            <tbody>
              {stocks.map((s) => (
                <tr key={s.symbol}>
                  <td>{s.symbol}</td>
                  <td>{s.name}</td>
                  <td>${s.price.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>Holdings</h2>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Qty</th>
                <th>Price</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {portfolio?.holdings.length ? (
                portfolio.holdings.map((h) => (
                  <tr key={h.symbol}>
                    <td>{h.symbol}</td>
                    <td>{h.qty}</td>
                    <td>${h.price.toFixed(2)}</td>
                    <td>${h.value.toFixed(2)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4}>No holdings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>

        <section className="panel">
          <h2>Trade</h2>
          <form onSubmit={handleTrade} className="trade-form">
            <label>
              Symbol
              <select
                value={form.symbol}
                onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol}>
                    {s.symbol}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Side
              <select
                value={form.side}
                onChange={(e) => setForm((f) => ({ ...f, side: e.target.value }))}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
              </select>
            </label>
            <label>
              Qty
              <input
                type="number"
                min="1"
                value={form.qty}
                onChange={(e) => setForm((f) => ({ ...f, qty: e.target.value }))}
              />
            </label>
            <button type="submit">Submit trade</button>
          </form>
        </section>
      </div>

      <section className="panel">
        <h2>Trade history</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Symbol</th>
              <th>Side</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {trades.length ? (
              trades.map((t) => (
                <tr key={t.id}>
                  <td>{new Date(t.timestamp).toLocaleTimeString()}</td>
                  <td>{t.symbol}</td>
                  <td>{t.side}</td>
                  <td>{t.qty}</td>
                  <td>${t.price.toFixed(2)}</td>
                  <td>${t.total.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>No trades yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
