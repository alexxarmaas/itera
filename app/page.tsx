import Link from "next/link";

const examples = [
  { emoji: "📵", title: "7 días sin TikTok", meta: "Vida digital · 7 días", signal: "Tiempo libre" },
  { emoji: "🌙", title: "Sin móvil después de las 23:00", meta: "Sueño · 14 días", signal: "Calidad del sueño" },
  { emoji: "🎧", title: "Trabajar sin música", meta: "Productividad · 7 días", signal: "Concentración" },
  { emoji: "💸", title: "Semana sin compras impulsivas", meta: "Dinero · 7 días", signal: "Gasto diario" },
];

export default function LandingPage() {
  return (
    <main className="landing labbook-landing">
      <nav className="landing-nav shell lab-nav">
        <Link href="/" className="brand"><span className="brand-mark">i</span><span>itera</span><small className="brand-edition">LABBOOK</small></Link>
        <div className="lab-nav-actions"><span className="lab-status"><i /> sistema listo</span><Link className="nav-cta" href="/app">Abrir laboratorio</Link></div>
      </nav>

      <section className="hero shell lab-hero">
        <div className="lab-hero-copy">
          <div className="eyebrow lab-eyebrow"><span>LAB / 001</span> EVIDENCIA PERSONAL</div>
          <h1>Prueba cambios.<br /><span>Quédate con lo que funciona.</span></h1>
          <p className="hero-copy">Itera convierte una duda cotidiana en una prueba con principio, seguimiento y veredicto. Sin perseguir hábitos para siempre.</p>
          <div className="hero-actions">
            <Link className="button button-accent" href="/app/new">Iniciar una prueba →</Link>
            <Link className="button button-secondary" href="/app/discover">Abrir biblioteca</Link>
          </div>
          <p className="hero-note"><span>●</span> Sin registro para empezar · datos locales durante el MVP</p>
        </div>

        <div className="lab-specimen-wrap" aria-label="Ejemplo de resultado de Itera">
          <div className="specimen-index">SPECIMEN / 07</div>
          <article className="lab-specimen">
            <div className="specimen-head"><div><span className="specimen-emoji">🌙</span><small>SUEÑO · EXPERIMENTO ACTIVO</small></div><span className="lab-badge">DÍA 7/14</span></div>
            <h2>Sin móvil después de las 23:00</h2>
            <p className="specimen-hypothesis"><span>HIPÓTESIS</span>Dormiré mejor si dejo de mirar el móvil antes de acostarme.</p>
            <div className="specimen-readout"><div><small>SEÑAL</small><strong>+21%</strong><span>calidad del sueño</span></div><div className="specimen-scale"><div><small>ANTES</small><strong>6.2</strong></div><span>→</span><div><small>DURANTE</small><strong>7.5</strong></div></div></div>
            <div className="specimen-verdict"><span className="verdict-dot" /> <div><small>LECTURA PROVISIONAL</small><strong>Señal positiva</strong></div></div>
          </article>
          <div className="specimen-note">N=7 CHECK-INS · DATOS AUTODECLARADOS</div>
        </div>
      </section>

      <section className="how shell lab-section">
        <div className="section-heading">
          <p className="eyebrow">MÉTODO ITERA</p>
          <h2>Una pregunta. Una señal. Un veredicto.</h2>
        </div>
        <div className="step-grid lab-steps">
          <article><span>01</span><small>FORMULA</small><h3>Prueba</h3><p>Convierte “¿y si...?” en un cambio pequeño, temporal y concreto.</p></article>
          <article><span>02</span><small>OBSERVA</small><h3>Mide</h3><p>Registra una señal útil en segundos. No necesitas cuantificar toda tu vida.</p></article>
          <article><span>03</span><small>CONCLUYE</small><h3>Decide</h3><p>Compara tu punto de partida con tus registros y decide si merece quedarse.</p></article>
        </div>
      </section>

      <section className="examples shell lab-section">
        <div className="section-heading row-heading">
          <div><p className="eyebrow">BIBLIOTECA DE PRUEBAS</p><h2>Empieza por una curiosidad.</h2></div>
          <Link href="/app/discover" className="text-link">Explorar biblioteca →</Link>
        </div>
        <div className="example-grid lab-example-grid">
          {examples.map((item, index) => (
            <article className="example-card lab-example" key={item.title}>
              <div className="example-top"><div className="example-emoji">{item.emoji}</div><span>0{index + 1}</span></div>
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
              <div className="example-signal"><small>SEÑAL</small><strong>{item.signal}</strong></div>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta shell lab-cta">
        <div className="cta-code">ITERATE / OBSERVE / DECIDE</div>
        <p className="eyebrow">NO NECESITAS OTRO HÁBITO</p>
        <h2>Necesitas una respuesta.</h2>
        <p>Empieza con siete días. Una sola variable. Una señal que te importe.</p>
        <Link className="button button-primary" href="/app/new">Abrir nueva ficha →</Link>
      </section>

      <footer className="landing-footer shell"><span>itera / labbook</span><span>Prueba · Mide · Decide</span><span>v0.2</span></footer>
    </main>
  );
}
