import Link from "next/link";

function first(value: string | string[] | undefined, fallback = "") {
  return Array.isArray(value) ? value[0] ?? fallback : value ?? fallback;
}

function safeNumber(value: string | string[] | undefined, fallback: number) {
  const parsed = Number(first(value));
  return Number.isFinite(parsed) ? parsed : fallback;
}

export default async function SharePage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const title = first(params.title, "Un experimento personal");
  const emoji = first(params.emoji, "🧪");
  const category = first(params.category, "Otro");
  const metric = first(params.metric, "Resultado");
  const unit = first(params.unit, "/10");
  const hypothesis = first(params.hypothesis, "Quiero comprobar si este cambio me funciona.");
  const mode = first(params.mode, "single");
  const baseline = safeNumber(params.baseline, 6);
  const average = safeNumber(params.average, baseline);
  const delta = safeNumber(params.delta, 0);
  const aAverage = safeNumber(params.aAverage, 0);
  const bAverage = safeNumber(params.bAverage, 0);
  const variantA = first(params.variantA, "A");
  const variantB = first(params.variantB, "B");
  const winner = first(params.winner);
  const days = Math.max(1, safeNumber(params.days, 7));
  const duration = Math.max(7, safeNumber(params.duration, 7));
  const checks = Math.max(0, safeNumber(params.checks, 0));
  const verdict = mode === "ab" ? (winner === "A" ? `${variantA} funcionó mejor` : winner === "B" ? `${variantB} funcionó mejor` : "No hubo una diferencia clara") : checks < 3 ? "Aún no hay datos suficientes" : delta > 8 ? "Sí, parece funcionarle" : delta < -8 ? "No parece ayudarle" : "No hay una señal clara";

  const retry = new URLSearchParams({ title, category, metric, duration: String(duration), hypothesis, mode });
  if (mode === "ab") { retry.set("variantA", variantA); retry.set("variantB", variantB); }

  return (
    <main className="share-page">
      <nav className="landing-nav shell"><Link href="/" className="brand"><span className="brand-mark">i</span><span>itera</span></Link><Link className="nav-cta" href="/app/discover">Explorar experimentos</Link></nav>
      <section className="share-result-shell">
        <div className="share-result-card">
          <div className="share-result-head"><span className="experiment-icon xl">{emoji}</span><span className="pill pill-done">{mode === "ab" ? "Resultado A/B" : "Resultado personal"}</span></div>
          <p className="eyebrow">ALGUIEN LO PROBÓ</p><h1>{title}</h1><p className="share-verdict">{verdict}.</p>
          {mode === "ab" ? <div className="share-ab-comparison"><div className={winner === "A" ? "winner" : ""}><small>A · {variantA}</small><strong>{aAverage.toFixed(1)}{unit}</strong></div><span>VS</span><div className={winner === "B" ? "winner" : ""}><small>B · {variantB}</small><strong>{bAverage.toFixed(1)}{unit}</strong></div></div> : <><div className="share-metric"><strong>{delta >= 0 ? "+" : ""}{delta.toFixed(0)}%</strong><span>en {metric.toLowerCase()}</span></div><div className="comparison final-comparison"><div><small>Antes</small><strong>{baseline.toFixed(1)}{unit}</strong></div><span>→</span><div><small>Durante</small><strong>{average.toFixed(1)}{unit}</strong></div></div></>}
          <p className="final-context">{checks} check-ins · {days} días. Resultado autodeclarado basado en registros personales; no es evidencia científica.</p>
        </div>
        <aside className="share-try-card"><p className="eyebrow">¿Y A TI?</p><h2>No tienes que creer el resultado.</h2><p>{mode === "ab" ? "Replica la misma comparación y descubre qué opción funciona mejor contigo." : "Prueba el mismo cambio y mídelo contra tu propio punto de partida."}</p><Link className="button button-primary full" href={`/app/new?${retry.toString()}`}>Replicar esta prueba →</Link><small>Gratis · sin registro para empezar</small></aside>
      </section>
      <footer className="landing-footer shell"><span>itera</span><span>Prueba · Mide · Decide</span></footer>
    </main>
  );
}
