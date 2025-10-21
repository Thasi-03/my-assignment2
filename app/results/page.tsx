"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";

export const dynamic = "force-dynamic"; // avoid static prerender errors

function ResultsInner() {
  const sp = useSearchParams();
  const t = Number(sp.get("t") ?? "0");
  const s = Number(sp.get("s") ?? "0");

  const time = `${Math.floor(t / 60)
    .toString()
    .padStart(2, "0")}:${(t % 60).toString().padStart(2, "0")}`;

  return (
    <section className="card">
      <h2>Results</h2>
      <p>
        <strong>Time:</strong> {time}
      </p>
      <p>
        <strong>Score:</strong> {s}
      </p>
      <p>Great job! Your result has been recorded.</p>
    </section>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<section className="card">Loading results…</section>}>
      <ResultsInner />
    </Suspense>
  );
}
