"use client";
import { useEffect, useState } from "react";

type Result = {
  id: string;
  player: string;
  timeSec: number;
  score: number;
  stages: number;
  createdAt: string;
};

export default function ResultsList() {
  const [items, setItems] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/results", { cache: "no-store" });
    setItems(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    await fetch(`/api/results/${id}`, { method: "DELETE" });
    setItems(prev => prev.filter(x => x.id !== id));
  }

  return (
    <section className="card">
      <h2>Results (latest first)</h2>
      <button onClick={load} style={{ marginBottom: 12 }}>Refresh</button>
      {loading ? <p>Loading…</p> : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th align="left">Player</th>
              <th align="left">Time</th>
              <th align="left">Score</th>
              <th align="left">Stages</th>
              <th align="left">Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.map(r => (
              <tr key={r.id} style={{ borderTop: "1px solid #2a2a2d" }}>
                <td>{r.player}</td>
                <td>{Math.floor(r.timeSec/60).toString().padStart(2,"0")}:
                    {(r.timeSec%60).toString().padStart(2,"0")}</td>
                <td>{r.score}</td>
                <td>{r.stages}</td>
                <td style={{ opacity:.8 }}>{new Date(r.createdAt).toLocaleString()}</td>
                <td>
                  <button onClick={() => remove(r.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ opacity:.8, paddingTop:8 }}>No results yet.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </section>
  );
}
