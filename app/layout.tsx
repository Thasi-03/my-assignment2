import "./globals.css";
import Link from "next/link";
import { cookies } from "next/headers";

export const metadata = {
  title: "Escape Room",
  description: "Interactive Escape Room Assignment",
};

// ⬇⬇ make this async and await cookies()
async function LastVisited() {
  const c = await cookies();
  const last = c.get("last_path")?.value;
  return (
    <div style={{ fontSize: 12, opacity: 0.8, marginBottom: 8 }}>
      {last ? `Last visited: ${last}` : ""}
    </div>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const today = new Date().toLocaleDateString();
  const name = "Thasigaran Sagadevan";
  const id = "21969946";

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#0b0b0c", color: "#eaeaea" }}>
        <header style={{ display: "flex", gap: 12, alignItems: "center", padding: "10px 16px", background: "#141416", borderBottom: "1px solid #2a2a2d" }}>
          <strong>{id}</strong>
          <nav style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/about">About</Link>
            <Link href="/escape">Escape Room</Link>
            <Link href="/results-list">Results</Link>
          </nav>
        </header>

        <main id="content" style={{ padding: 16, maxWidth: 960, margin: "0 auto" }}>
          <LastVisited />
          {children}
        </main>

        <footer style={{ padding: 16, borderTop: "1px solid #2a2a2d", opacity: 0.8 }}>
          {name} • {id} • {today}
        </footer>
      </body>
    </html>
  );
}
