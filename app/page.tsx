import Link from "next/link";

const examples = [
  { emoji: "📵", title: "7 días sin TikTok", meta: "Vida digital · 7 días" },
  { emoji: "🌙", title: "Sin móvil después de las 23:00", meta: "Sueño · 14 días" },
  { emoji: "🎧", title: "Trabajar sin música", meta: "Productividad · 7 días" },
  { emoji: "💸", title: "Semana sin compras impulsivas", meta: "Dinero · 7 días" },
];

export default function LandingPage() {
  return (
    <main className="landing">
      <nav className="landing-nav shell">
        <Link href="/" className="brand"><span className="brand-mark">i</span><span>itera</span></Link>
        <Link className="nav-cta" href="/app">Abrir It era</Link>
      </nav>

      <section className="hero shell">
        <div className="eyebrow">TU VIDA, PERO CON DATOS</div>
        <h1>Deja de preguntarte.<br /><span>Pruébalo.</span></h1>
        <p className="hero-copy">Haz un pequeño cambio durante unos días, mide lo que te importa y descubre si realmente funciona para ti.</p>
        <div className="hero-actions">
          <Link className="button button-primary" href="/app/new">Crear mi primer experimento</Link>
          <Link className="button button-secondary" href="/app/discover">Ver experimentos</Link>
        </div>
        <p className="hero-note">Sin registro para empezar · Menos de 30 segundos</p>
      </section>

      <section className="how shell">
        <div className="section-heading">
          <p className="eyebrow">CÓMO FUNCIONA</p>
          <h2>Una pregunta. Unos días. Una respuesta.</h2>
        </div>
        <div className="step-grid">
          <article><span>01</span><h3>Prueba</h3><p>Elige un cambio concreto que quieras poner a prueba.</p></article>
          <article><span>02</span><h3>Mide</h3><p>Haz un check-in de pocos segundos cada día.</p></article>
          <article><span>03</span><h3>Decide</h3><p>Compara el antes y el después y decide si merece quedarse.</p></article>
        </div>
      </section>

      <section className="examples shell">
        <div className="section-heading row-heading">
          <div><p className="eyebrow">IDEAS PARA PROBAR</p><h2>Empieza por algo pequeño.</h2></div>
          <Link href="/app/discover" className="text-link">Ver todos →</Link>
        </div>
        <div className="example-grid">
          {examples.map((item) => (
            <article className="example-card" key={item.title}>
              <div className="example-emoji">{item.emoji}</div>
              <h3>{item.title}</h3>
              <p>{item.meta}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-cta shell">
        <p className="eyebrow">NO NECESITAS OTRO HÁBITO</p>
        <h2>Solo necesitas saber si funciona.</h2>
        <Link className="button button-primary" href="/app/new">Empezar un experimento</Link>
      </section>

      <footer className="landing-footer shell"><span>itera</span><span>Prueba · Mide · Decide</span></footer>
    </main>
  );
}
