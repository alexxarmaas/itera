import { ExperimentTemplate } from "./types";

export const catalog: ExperimentTemplate[] = [
  {
    slug: "no-phone-before-bed", title: "Sin móvil después de las 23:00", emoji: "🌙", category: "Sueño",
    description: "Deja el móvil fuera durante la última parte del día y mide cómo te levantas.", durationDays: 14,
    hypothesis: "Dormiré mejor si dejo de mirar el móvil antes de acostarme.", metricLabel: "Calidad del sueño", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "bed-30-min-earlier", title: "Acostarme 30 min antes", emoji: "🛏️", category: "Sueño",
    description: "Adelanta tu hora habitual de acostarte media hora durante diez días.", durationDays: 10,
    hypothesis: "Me levantaré con una mayor sensación de descanso.", metricLabel: "Descanso al despertar", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "fixed-wake-time", title: "Levantarme siempre a la misma hora", emoji: "⏰", category: "Sueño",
    description: "Mantén una hora de levantarte estable durante dos semanas y observa tu descanso.", durationDays: 14,
    hypothesis: "Una hora estable hará que me cueste menos empezar el día.", metricLabel: "Facilidad al despertar", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "read-before-bed", title: "20 min de lectura antes de dormir", emoji: "📖", category: "Sueño",
    description: "Sustituye los últimos veinte minutos de pantalla por lectura tranquila.", durationDays: 10,
    hypothesis: "Terminaré el día con menos activación y mejor sensación al dormir.", metricLabel: "Calidad del descanso", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "no-tiktok-week", title: "7 días sin TikTok", emoji: "📵", category: "Vida digital",
    description: "Quita TikTok durante una semana y observa si cambia tu concentración.", durationDays: 7,
    hypothesis: "Tendré más capacidad de concentración sin TikTok.", metricLabel: "Concentración", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "notifications-off", title: "Notificaciones no esenciales OFF", emoji: "🔕", category: "Vida digital",
    description: "Silencia durante diez días todo lo que no requiera una respuesta inmediata.", durationDays: 10,
    hypothesis: "Interrumpiré menos lo que estoy haciendo y sentiré más control.", metricLabel: "Control de la atención", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "no-phone-first-30", title: "30 min sin móvil al despertar", emoji: "🌅", category: "Vida digital",
    description: "Empieza el día sin abrir redes, mensajes ni noticias durante media hora.", durationDays: 10,
    hypothesis: "Empezaré el día con menos sensación de urgencia.", metricLabel: "Calma al empezar", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "grayscale-phone", title: "Móvil en escala de grises", emoji: "◻️", category: "Vida digital",
    description: "Pon la pantalla en escala de grises y observa cuánto disminuye el impulso de abrir apps.", durationDays: 7,
    hypothesis: "Miraré menos el móvil si las apps resultan menos estimulantes visualmente.", metricLabel: "Control del uso", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "no-social-before-noon", title: "Sin redes antes de las 12:00", emoji: "🕛", category: "Vida digital",
    description: "Reserva la mañana para ti antes de abrir cualquier red social.", durationDays: 10,
    hypothesis: "Tendré mañanas más enfocadas si retraso las redes sociales.", metricLabel: "Enfoque matinal", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "deep-work-50-10", title: "Deep Work 50/10", emoji: "🧠", category: "Productividad",
    description: "Trabaja en bloques de 50 minutos con 10 de descanso, sin multitarea.", durationDays: 10,
    hypothesis: "Terminaré el día con mayor sensación de productividad.", metricLabel: "Productividad", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "music-vs-silence", title: "Trabajar sin música", emoji: "🎧", category: "Productividad",
    description: "Trabaja una semana en silencio y compara tu concentración habitual.", durationDays: 7,
    hypothesis: "Me concentraré mejor trabajando sin música.", metricLabel: "Concentración", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "single-task-hour", title: "Una sola tarea durante 60 min", emoji: "🎯", category: "Productividad",
    description: "Elige una tarea y evita cambiar de contexto durante una hora completa.", durationDays: 7,
    hypothesis: "Acabaré más trabajo útil si no alterno entre tareas.", metricLabel: "Avance percibido", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "three-priorities", title: "Solo 3 prioridades al día", emoji: "③", category: "Productividad",
    description: "Empieza cada mañana eligiendo únicamente tres resultados importantes.", durationDays: 10,
    hypothesis: "Tendré más claridad si reduzco mi lista a tres prioridades reales.", metricLabel: "Claridad", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "plan-tomorrow", title: "Planificar mañana antes de terminar", emoji: "🗒️", category: "Productividad",
    description: "Dedica cinco minutos al final del día a decidir por dónde empezarás mañana.", durationDays: 10,
    hypothesis: "Empezaré a trabajar más rápido si dejo decidido el primer paso.", metricLabel: "Facilidad para empezar", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "morning-workout", title: "Entrenar antes de trabajar", emoji: "🏋️", category: "Energía",
    description: "Mueve tu entrenamiento a primera hora y mide tu energía durante el día.", durationDays: 14,
    hypothesis: "Tendré más energía durante el día si entreno por la mañana.", metricLabel: "Energía", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "midday-walk", title: "Caminar 20 min al mediodía", emoji: "🚶", category: "Energía",
    description: "Haz una pausa caminando a mitad del día y registra cómo afrontas la tarde.", durationDays: 10,
    hypothesis: "Llegaré a la tarde con mejor energía después de caminar.", metricLabel: "Energía por la tarde", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "outdoor-break", title: "Pausa de 15 min al aire libre", emoji: "🌿", category: "Energía",
    description: "Sal fuera durante una pausa diaria, sin móvil ni trabajo durante quince minutos.", durationDays: 10,
    hypothesis: "Volveré a mis tareas con una sensación mayor de energía mental.", metricLabel: "Energía mental", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "no-spend-week", title: "Semana sin compras impulsivas", emoji: "💸", category: "Dinero",
    description: "Durante siete días compra solo lo planificado y mide tu control del gasto.", durationDays: 7,
    hypothesis: "Sentiré mayor control sobre mis gastos si elimino las compras impulsivas.", metricLabel: "Control del gasto", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "purchase-24h-rule", title: "Regla de las 24 horas", emoji: "⏳", category: "Dinero",
    description: "Espera un día completo antes de cualquier compra que no estuviera planificada.", durationDays: 14,
    hypothesis: "Tomaré mejores decisiones si separo el impulso del momento de la compra.", metricLabel: "Control de compra", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "cash-weekend", title: "Fin de semana solo con efectivo", emoji: "💶", category: "Dinero",
    description: "Define una cantidad y usa únicamente ese efectivo durante el fin de semana.", durationDays: 7,
    hypothesis: "Seré más consciente de lo que gasto si veo físicamente cómo disminuye el dinero.", metricLabel: "Conciencia del gasto", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "weekly-budget-first", title: "Presupuesto antes de empezar la semana", emoji: "📊", category: "Dinero",
    description: "Decide el domingo cuánto puedes gastar en ocio y variables durante la semana.", durationDays: 14,
    hypothesis: "Sentiré más control si decido el gasto antes de que ocurra.", metricLabel: "Control financiero", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "study-50-10", title: "Estudiar en bloques 50/10", emoji: "📚", category: "Estudio",
    description: "Haz bloques de cincuenta minutos de estudio y diez de descanso real.", durationDays: 10,
    hypothesis: "Mantendré mejor la concentración con descansos definidos.", metricLabel: "Concentración estudiando", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
  {
    slug: "active-recall", title: "Repaso sin mirar apuntes", emoji: "🧩", category: "Estudio",
    description: "Termina cada sesión intentando recordar lo aprendido sin consultar el material.", durationDays: 14,
    hypothesis: "Recordaré mejor si intento recuperar la información activamente.", metricLabel: "Sensación de recuerdo", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 5,
  },
  {
    slug: "phone-outside-study", title: "Móvil fuera durante el estudio", emoji: "🚪", category: "Estudio",
    description: "Deja el móvil físicamente fuera de tu zona de estudio en cada sesión.", durationDays: 10,
    hypothesis: "Tendré sesiones más profundas si el móvil no está al alcance.", metricLabel: "Calidad del estudio", metricMin: 1, metricMax: 10, metricUnit: "/10", baseline: 6,
  },
];
