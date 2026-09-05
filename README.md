# Itera

**Prueba. Mide. Decide.**

Itera es una web de experimentos personales: eliges un pequeño cambio, lo pruebas durante unos días, haces check-ins rápidos y comparas el resultado con tu punto de partida.

## MVP 0.1

- Landing comercial.
- Dashboard de experimentos activos.
- Catálogo de experimentos listos para empezar.
- Creación de experimentos personalizados.
- Check-in diario con métrica 1–10 y nota opcional.
- Comparación automática contra baseline.
- Historial de check-ins.
- Persistencia local en navegador, sin registro ni backend.
- Diseño responsive/PWA-ready.

## Stack

- Next.js 16
- React 19
- TypeScript
- CSS nativo
- localStorage durante validación del MVP

## Desarrollo

```bash
npm install
npm run dev
```

Abrir `http://localhost:3000`.

## Siguiente fase

1. Validar onboarding y flujo de check-in.
2. Añadir Supabase Auth + Postgres cuando el modelo de datos esté estable.
3. Resultados finales y tarjetas compartibles.
4. Landing pública por experimento (`/e/:slug`).
5. Analytics de activación, D1/D7 y tasa de finalización.
6. Preparar monetización Free / Plus sin bloquear la validación inicial.

## Principio de producto

Itera no es un habit tracker. Cada experimento tiene un inicio, un final y una pregunta que responder.
