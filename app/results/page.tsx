"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Results() {
  const q = useSearchParams();
  const router = useRouter();

  const timeSec = Number(q.get("t") ?? "0");
  const score = Number(q.get("s") ?? "0");
  const stages = 3;

  const [savedId, setSavedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        setSaving(true);
        const res = await fetch("/api/results", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ player: "Player 1", timeSec, score, stages }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to save");
        setSavedId(data.id);
      } catch (e: any) {
        setError(e?.message ?? "Save failed");
      } finally {
        setSaving(false);
      }
    })();
  }, [timeSec, score, stages]);

  return (
    <section className="card">
      <h2>Results</h2>
      <p>Time: <strong>{timeSec}s</strong></p>
      <p>Score: <strong>{score}</strong></p>

      {saving && <p>Saving your result…</p>}
      {error && <p role="alert">Error: {error}</p>}
      {savedId && <p>Saved! Result ID: <code>{savedId}</code></p>}

      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button onClick={() => router.push("/escape")}>Play again</button>
        <a href="/results-list">View all results</a>
      </div>
    </section>
  );
}
