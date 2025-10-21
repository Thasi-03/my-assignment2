"use client";
import { useEffect, useMemo, useState } from "react";

type Tab = { title: string; content: string };
type ExportMode = { type: "all" } | { type: "one"; index: number };

/* localStorage keys */
const LS_TABS = "tabs_v1";
const LS_LABEL = "tabs_label_v1";

/* escape user text for the exported HTML */
const esc = (s: string) =>
  s.replace(/[&<>"']/g, (m) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]!));

/* builds the single-file export (inline CSS + inline JS) */
function buildHtml(useTabs: Tab[], label: string) {
  const html = `
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tabs</title>

<!-- Student: 21969946 -->
<div id="app" style="font-family:system-ui,Arial,sans-serif;max-width:960px;margin:1rem auto;">
  <h1 style="font-size:1.25rem;margin:0 0 .75rem;">Tabs Demo</h1>

  <div role="tablist" aria-label="${esc(label)}" style="display:flex;gap:.25rem;flex-wrap:wrap;">
    ${useTabs
      .map(
        (t, i) => `
      <button role="tab" id="tab-${i}" aria-controls="panel-${i}" aria-selected="${i === 0}" tabindex="${
          i === 0 ? 0 : -1
        }"
        style="border:1px solid #888;padding:.5rem .75rem;border-radius:.5rem;background:${
          i === 0 ? "#eee" : "#fff"
        };cursor:pointer;">
        ${esc(t.title)}
      </button>`
      )
      .join("")}
  </div>

  ${useTabs
    .map(
      (t, i) => `
  <div role="tabpanel" id="panel-${i}" aria-labelledby="tab-${i}" ${i === 0 ? "" : "hidden"}
    style="border:1px solid #888;border-radius:.5rem;padding:1rem;margin-top:.5rem;">
    ${esc(t.content)}
  </div>`
    )
    .join("")}
</div>

<script>
(function(){
  function setCookie(name,value,days){var d=new Date();d.setTime(d.getTime()+days*864e5);document.cookie=name+"="+encodeURIComponent(value)+";expires="+d.toUTCString()+";path=/";}
  function getCookie(name){var m=document.cookie.match(new RegExp('(?:^|; )'+name+'=([^;]*)'));return m?decodeURIComponent(m[1]):null;}

  var n=${useTabs.length}, idx=[${useTabs.map((_, i) => i).join(",")}];
  var selected=parseInt(getCookie("selected_tab")||"0",10);

  function select(i){
    idx.forEach(function(j){
      var tab=document.getElementById("tab-"+j);
      var panel=document.getElementById("panel-"+j);
      var active=j===i;
      tab.setAttribute("aria-selected", active);
      tab.tabIndex = active?0:-1;
      tab.style.background = active?"#eee":"#fff";
      if(active){ panel.removeAttribute("hidden"); tab.focus(); }
      else { panel.setAttribute("hidden",""); }
    });
    setCookie("selected_tab", i, 30);
  }

  idx.forEach(function(i){
    var el=document.getElementById("tab-"+i);
    if(!el) return;
    el.addEventListener("click", function(){ select(i); });
    el.addEventListener("keydown", function(e){
      if(e.key==="ArrowRight"){ select((i+1)%n); }
      if(e.key==="ArrowLeft"){ select((i-1+n)%n); }
    });
  });

  if(!isNaN(selected) && selected>=0 && selected<n){ select(selected); }
})();
</script>
</html>`.trim();
  return html;
}

export default function HomePage() {
  const [label, setLabel] = useState("Sample tabs");
  const [tabs, setTabs] = useState<Tab[]>([
    { title: "Tab 1", content: "Hello from Tab 1" },
    { title: "Tab 2", content: "Hello from Tab 2" },
  ]);
  const [mode, setMode] = useState<ExportMode>({ type: "all" });
  const [out, setOut] = useState("");

  /* seed preview with a tiny doc so the iframe doesn't churn while typing */
  useEffect(() => {
    setOut(`<!doctype html><html lang="en"><meta charset="utf-8"><title>Tabs</title></html>`);
  }, []);

  /* load saved tabs/label once */
  useEffect(() => {
    try {
      const savedTabs = localStorage.getItem(LS_TABS);
      if (savedTabs) {
        const parsed = JSON.parse(savedTabs);
        if (Array.isArray(parsed)) setTabs((parsed as Tab[]).slice(0, 15));
      }
      const savedLabel = localStorage.getItem(LS_LABEL);
      if (typeof savedLabel === "string") setLabel(savedLabel);
    } catch {}
  }, []);

  /* save on change */
  useEffect(() => {
    try { localStorage.setItem(LS_TABS, JSON.stringify(tabs)); } catch {}
  }, [tabs]);
  useEffect(() => {
    try { localStorage.setItem(LS_LABEL, label); } catch {}
  }, [label]);

  /* keep export selection valid when tabs are deleted */
  useEffect(() => {
    if (mode.type === "one" && (mode.index < 0 || mode.index >= tabs.length)) setMode({ type: "all" });
  }, [tabs.length, mode]);

  /* HTML that would be exported right now (follows Export selector) */
  const computed = useMemo(() => {
    if (mode.type === "all") return buildHtml(tabs, label);
    const t = tabs[mode.index];
    return buildHtml([t], `${label} — ${t?.title ?? "Tab"}`);
  }, [mode, tabs, label]);

  /* update preview/output manually */
  const generate = () => setOut(computed);

  /* Copy/Download always use the current selection and sync the Output box */
  const copy = () => {
    const html = computed;
    setOut(html);
    navigator.clipboard.writeText(html);
  };

  const download = () => {
    const html = computed;
    setOut(html);
    const base = mode.type === "all" ? "Tabs" : `Tab-${mode.index + 1}`;
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${base}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  /* move tab up/down */
  const move = (i: number, dir: -1 | 1) => {
    setTabs((prev) => {
      const a = [...prev];
      const j = i + dir;
      if (j < 0 || j >= a.length) return a;
      [a[i], a[j]] = [a[j], a[i]];
      return a;
    });
  };

  return (
    <section className="container mx-auto p-4 space-y-4 lg:space-y-0">
      <h1 className="text-2xl font-semibold mb-2">HTML Tabs Generator</h1>

      {/* landscape layout */}
      <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-stretch">
        {/* editor */}
        <div className="border rounded p-3 lg:h-[78vh] overflow-auto">
          <label className="block mb-3">
            ARIA label for tablist
            <input
              className="border rounded p-2 w-full"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </label>

          <div className="space-y-2" aria-label="Configure tabs">
            {tabs.map((t, i) => (
              <fieldset key={i} className="border rounded p-3">
                <legend className="px-1">Tab {i + 1}</legend>

                <div className="flex gap-2 mb-2">
                  <button type="button" className="px-2 py-1 border rounded" onClick={() => move(i, -1)}>↑</button>
                  <button type="button" className="px-2 py-1 border rounded" onClick={() => move(i, 1)}>↓</button>
                  <button
                    type="button"
                    className="px-2 py-1 border rounded ml-auto"
                    onClick={() => setTabs((p) => p.filter((_, j) => j !== i))}
                  >
                    Remove
                  </button>
                </div>

                <label className="block mb-1">
                  Title
                  <input
                    className="border rounded p-2 w-full"
                    value={t.title}
                    onChange={(e) =>
                      setTabs((p) => p.map((x, j) => (j === i ? { ...x, title: e.target.value } : x)))
                    }
                  />
                </label>

                <label className="block">
                  Content
                  <textarea
                    className="border rounded p-2 w-full min-h-24"
                    value={t.content}
                    onChange={(e) =>
                      setTabs((p) => p.map((x, j) => (j === i ? { ...x, content: e.target.value } : x)))
                    }
                  />
                </label>
              </fieldset>
            ))}

            <button
              className="px-3 py-2 border rounded disabled:opacity-50"
              type="button"
              onClick={() =>
                setTabs((p) => (p.length >= 15 ? p : [...p, { title: `Tab ${p.length + 1}`, content: "..." }]))
              }
              disabled={tabs.length >= 15}
              title={tabs.length >= 15 ? "Maximum 15 tabs" : ""}
            >
              + Add Tab
            </button>
          </div>
        </div>

        {/* actions + preview + output */}
        <div className="flex flex-col gap-3 lg:h-[78vh] min-h-[60vh]">
          <div className="border rounded p-2 sticky top-0 bg-[var(--background)] z-10">
            <div className="flex flex-wrap gap-2 items-center">
              <button className="px-3 py-2 border rounded" type="button" onClick={generate}>Generate</button>
              <button className="px-3 py-2 border rounded" type="button" onClick={copy}>Copy</button>
              <button className="px-3 py-2 border rounded" type="button" onClick={download}>Download</button>

              <label className="ml-auto flex items-center gap-2">
                <span className="text-sm opacity-80">Export</span>
                <select
                  className="border rounded p-2"
                  value={mode.type === "all" ? "all" : `one:${mode.index}`}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "all") setMode({ type: "all" });
                    else {
                      const idx = parseInt(v.split(":")[1]!, 10);
                      setMode({ type: "one", index: idx });
                    }
                  }}
                >
                  <option value="all">All tabs</option>
                  {tabs.map((t, i) => (
                    <option key={i} value={`one:${i}`}>
                      Tab {i + 1}: {t.title || "(untitled)"}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="border rounded flex-1 min-h-0">
            <iframe title="Preview" className="w-full h-full" srcDoc={out} />
          </div>

          <div className="border rounded flex-1 min-h-0">
            <textarea className="w-full h-full p-2 border-0 outline-none resize-none" value={out} readOnly />
          </div>
        </div>
      </div>
    </section>
  );
}
