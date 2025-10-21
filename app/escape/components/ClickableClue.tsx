"use client";
import { useEffect, useState } from "react";

type Hotspot = {
  id: "laptop" | "door" | "key" | "paper";
  style: React.CSSProperties;
  unlockAt?: number; // 1-based stage at which this becomes available
  title: string;
  body: JSX.Element | string;
};

type Props = {
  onReveal: (hotspotId: Hotspot["id"]) => void;
  currentStage: number; // 1-based
};

export default function ClickableClue({ onReveal, currentStage }: Props) {
  const [open, setOpen] = useState<Hotspot["id"] | null>(null);
  const [lockedInfo, setLockedInfo] = useState<string | null>(null);

  // Animation flag when door becomes available
  const [doorUnlocked, setDoorUnlocked] = useState(false);
  useEffect(() => {
    if (currentStage >= 4) setDoorUnlocked(true);
  }, [currentStage]);

  const hotspots: Hotspot[] = [
    {
      id: "laptop",
      style: { top: "55%", left: "40%", width: "10%", height: "10%", borderRadius: 10 },
      title: "Bug Report",
      body: (
        <>
          The laptop shows this code: <code>consol.log("hi")</code>. That’s a typo — fix it to{" "}
          <code>console.log</code> in the Format/Debug stage.
        </>
      ),
    },
    {
      id: "key",
      style: { top: "72%", left: "22%", width: "9%", height: "9%", borderRadius: 10 },
      title: "Rusty Key",
      body: (
        <>
          The key tag reads <strong>19475</strong>. Try adding the digits together — it might unlock
          something.
        </>
      ),
    },
    {
      id: "paper",
      style: { top: "48%", left: "47%", width: "13%", height: "10%", borderRadius: 10 },
      title: "Crumpled Paper",
      body: (
        <>
          The note says:{" "}
          <code>
            &lt;!doctype html&gt;&lt;html&gt;&lt;body&gt;ok&lt;/body&gt;&lt;/html&gt;
          </code>
          . Looks like a hint about valid HTML syntax!
        </>
      ),
    },
    {
      id: "door",
      style: { top: "32%", left: "8%", width: "12%", height: "38%", borderRadius: 14 },
      unlockAt: 4,
      title: "Exit Door",
      body: (
        <>
          The heavy wooden door creaks... it’s unlocked! You’re free to escape — or are you?
        </>
      ),
    },
  ];

  function clickHotspot(hs: Hotspot) {
    if (hs.unlockAt && currentStage < hs.unlockAt) {
      setLockedInfo(`Locked: available from Stage ${hs.unlockAt}.`);
      setTimeout(() => setLockedInfo(null), 1600);
      return;
    }
    setOpen(hs.id);
    onReveal(hs.id);
  }

  return (
    <div style={{ position: "relative", borderRadius: 12, overflow: "hidden" }}>
      {/* Background image with slight brightness bump when door unlocks */}
      <img
        src="/blog02.jpg"
        alt="Escape room background"
        style={{
          width: "100%",
          height: "auto",
          display: "block",
          transition: "filter 900ms ease",
          filter: doorUnlocked ? "brightness(1.15)" : "brightness(1)",
        }}
      />

      {/* Hotspots */}
      {hotspots.map((hs) => {
        const isDoor = hs.id === "door";
        const doorPulse =
          isDoor && doorUnlocked
            ? { animation: "doorPulse 1.4s ease-in-out infinite" as const }
            : {};
        return (
          <button
            key={hs.id}
            aria-label={hs.title}
            onClick={() => clickHotspot(hs)}
            style={{
              position: "absolute",
              border: "1px solid #2a2a2d",
              background: "rgba(0,0,0,.25)",
              backdropFilter: "blur(2px)",
              cursor: "pointer",
              transition: "transform .15s, box-shadow .15s",
              ...hs.style,
              ...doorPulse,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.05)";
              e.currentTarget.style.boxShadow = "0 0 0 2px rgba(255,255,255,.2) inset";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "none";
            }}
            title={hs.title}
          />
        );
      })}

      {/* Small toast for locked info */}
      {lockedInfo && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            padding: "8px 12px",
            background: "rgba(0,0,0,.6)",
            color: "white",
            borderRadius: 8,
            fontSize: 12,
          }}
        >
          {lockedInfo}
        </div>
      )}

      {/* Brief white radial glow when door first unlocks */}
      {doorUnlocked && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            animation: "escapeGlow 2.6s ease forwards",
            background:
              "radial-gradient( circle at 12% 40%, rgba(255,255,255,0.85), rgba(255,255,255,0.0) 60% )",
            mixBlendMode: "screen",
          }}
        />
      )}

      {/* Dialog overlay */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,.55)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
          onClick={() => setOpen(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 720 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ marginTop: 0 }}>
              {hotspots.find((h) => h.id === open)?.title}
            </h3>
            <p>{hotspots.find((h) => h.id === open)?.body}</p>
            <button onClick={() => setOpen(null)}>Close</button>
          </div>
        </div>
      )}

      {/* Local CSS keyframes */}
      <style jsx>{`
        @keyframes escapeGlow {
          0% {
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes doorPulse {
          0% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.25) inset;
          }
          50% {
            box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.35) inset;
          }
          100% {
            box-shadow: 0 0 0 0 rgba(255, 255, 255, 0.25) inset;
          }
        }
      `}</style>
    </div>
  );
}
