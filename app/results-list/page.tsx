export default async function ResultsList() {
  const res = await fetch("http://localhost:3000/api/results", { cache: "no-store" });
  const items = await res.json();

  return (
    <section className="card">
      <h2>Saved Results</h2>
      <ul>
        {items.length === 0 && <li>No results saved yet.</li>}
        {items.map((r: any) => (
          <li key={r.id}>
            {new Date(r.createdAt).toLocaleString()} • {r.player} • {r.timeSec}s • Score {r.score} • Stages {r.stages}
          </li>
        ))}
      </ul>
    </section>
  );
}
