"use client";

import ClientPathRemember from "../(utils)/client-path";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ClickableClue from "./components/ClickableClue";

/** ---- Stages (puzzles) ---- */
type Stage = {
  id: number;
  title: string;
  brief: string;
  inputLabel: string;
  placeholder?: string;
  check: (answer: string) => boolean;
  hint: string;
};

const STAGES: Stage[] = [
  {
    id: 1,
    title: "Stage 1: Decode the word",
    brief: `Note: "Uifsf jt b tfdsfu qbttqisbtf" — reverse Caesar +1.`,
    inputLabel: "Decoded phrase",
    placeholder: "there is a secret passphrase",
    check: (a) => a.trim().toLowerCase() === "there is a secret passphrase",
    hint: "Shift each letter back by one alphabet.",
  },
  {
    id: 2,
    title: "Stage 2: Sum the digits",
    brief: "Keypad shows 1, 9, 4, 7, 5. Enter their total.",
    inputLabel: "Total",
    placeholder: "26",
    check: (a) => Number(a.trim()) === 26,
    hint: "Add them carefully.",
  },
  {
    id: 3,
    title: "Stage 3: Minimal HTML",
    brief: "Type a valid minimal HTML page on one line.",
    inputLabel: "HTML",
    placeholder: "<!doctype html><html><body>ok</body></html>",
    check: (a) => {
      const s = a.trim().toLowerCase();
      return (
        s.startsWith("<!doctype html>") &&
        s.includes("<html") &&
        s.includes("</html>") &&
        s.includes("<body") &&
        s.includes("</body>")
      );
    },
    hint: "Include <!doctype html>, <html>…</html>, and <body>…</body>.",
  },
];

/** ---- Page ---- */
export default function EscapeRoom() {
  const router = useRouter();

  // timer
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      if (raf.current) cancelAnimationFrame(raf.current);
      return;
    }
    let start = performance.now();
    const tick = (t: number) => {
      const d = t - start;
      start = t;
      setElapsed((e) => e + d / 1000);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [running]);

  const hhmmss = useMemo(() => {
    const s = Math.floor(elapsed % 60);
    const m = Math.floor((elapsed / 60) % 60);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(m)}:${pad(s)}`;
  }, [elapsed]);

  const [i, setI] = useState(0);
  const [answers, setAnswers] = useState<string[]>(Array(STAGES.length).fill(""));
  const [hints, setHints] = useState<boolean[]>(Array(STAGES.length).fill(false));

  const score = useMemo(() => {
    const hintPenalty = hints.filter(Boolean).length * 5;
    const timePenalty = Math.floor(elapsed / 60);
    return Math.max(0, 100 - hintPenalty - timePenalty);
  }, [hints, elapsed]);

  // --- Unlock animation (10 seconds) before navigating ---
  function playUnlockAndNavigate(t: number, s: number) {
    const glow = document.createElement("div");
    glow.style.position = "fixed";
    glow.style.inset = "0";
    glow.style.pointerEvents = "none";
    glow.style.background =
      "radial-gradient(circle at 20% 40%, rgba(255,255,255,0.9), rgba(255,255,255,0) 70%)";
    glow.style.animation = "fadeOut 10s ease forwards";
    document.body.appendChild(glow);

    setTimeout(() => {
      try {
        document.body.removeChild(glow);
      } catch {}
      router.push(`/results?t=${t}&s=${s}`);
    }, 10000); // 10-second delay
  }

  function submit() {
    const stage = STAGES[i];
    if (stage.check(answers[i])) {
      if (i === STAGES.length - 1) {
        setRunning(false);
        const t = Math.floor(elapsed);
        const s = score;
        playUnlockAndNavigate(t, s);
      } else {
        setI(i + 1);
      }
    } else {
      alert("Not quite right—try again!");
    }
  }

  return (
    <section className="card">
      <ClientPathRemember />
      <h2>Escape Room</h2>

      <div className="row">
        <div>
          <strong>Timer:</strong> {hhmmss}
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <button onClick={() => setRunning(true)}>Start</button>
            <button onClick={() => setRunning(false)}>Pause</button>
            <button
              onClick={() => {
                setRunning(false);
                setElapsed(0);
              }}
            >
              Reset
            </button>
          </div>
        </div>
        <div style={{ marginLeft: "auto" }}>
          <strong>Score:</strong> {score}
          <div style={{ fontSize: 12, opacity: 0.75 }}>
            (Hints −5 each, −1/min)
          </div>
        </div>
      </div>

      {/* Background with hotspots */}
      <div style={{ marginTop: 12, marginBottom: 16 }}>
        <ClickableClue
          currentStage={i + 1}
          onReveal={() =>
            setHints((prev) => prev.map((x, idx) => (idx === i ? true : x)))
          }
        />
      </div>

      <h3 style={{ marginTop: 16 }}>{STAGES[i].title}</h3>
      <p>{STAGES[i].brief}</p>

      <label htmlFor="ans">{STAGES[i].inputLabel}</label>

      {STAGES[i].id === 3 ? (
        <textarea
          id="ans"
          style={{ width: "100%", minHeight: 140 }}
          value={answers[i]}
          placeholder={STAGES[i].placeholder}
          onChange={(e) =>
            setAnswers((prev) =>
              prev.map((x, idx) => (idx === i ? e.target.value : x))
            )
          }
        />
      ) : (
        <input
          id="ans"
          value={answers[i]}
          placeholder={STAGES[i].placeholder}
          onChange={(e) =>
            setAnswers((prev) =>
              prev.map((x, idx) => (idx === i ? e.target.value : x))
            )
          }
        />
      )}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        <button onClick={submit}>Submit</button>
        <button
          type="button"
          onClick={() =>
            setHints((prev) => prev.map((x, idx) => (idx === i ? true : x)))
          }
        >
          Show hint
        </button>
      </div>

      {hints[i] && (
        <div className="card" role="note" style={{ marginTop: 10 }}>
          <strong>Hint:</strong> {STAGES[i].hint}
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <progress value={i + 1} max={STAGES.length} />
        <div style={{ fontSize: 12, opacity: 0.8 }}>
          Stage {i + 1} of {STAGES.length}
        </div>
      </div>

      {/* Local keyframes for 10-second unlock glow */}
      <style jsx global>{`
        @keyframes fadeOut {
          0% {
            opacity: 0;
          }
          10% {
            opacity: 1;
          }
          90% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </section>
  );
}
