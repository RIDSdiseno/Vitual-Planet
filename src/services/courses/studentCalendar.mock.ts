export type StudentCalendarEventType =
  | "CLASS"
  | "ASSIGNMENT"
  | "QUIZ"
  | "EXAM"
  | "DEADLINE"
  | "REMINDER";

export type StudentCalendarEvent = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  type: StudentCalendarEventType;
  courseName?: string;
  time?: string; // "18:30"
  description?: string;
};

export type StudentNotificationLevel = "INFO" | "WARNING" | "DANGER" | "SUCCESS";

export type StudentNotification = {
  id: string;
  createdAt: string; // YYYY-MM-DD
  title: string;
  message: string;
  level: StudentNotificationLevel;
  actionLabel?: string;
  actionTo?: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function addDaysISO(base: Date, days: number) {
  const d = new Date(base);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export async function getStudentCalendarMock(): Promise<StudentCalendarEvent[]> {
  await new Promise((r) => setTimeout(r, 120));
  const today = new Date();

  return [
    {
      id: "ev1",
      date: addDaysISO(today, 0),
      time: "18:30",
      title: "Clase en vivo: Fracciones",
      type: "CLASS",
      courseName: "Matemáticas",
    },
    {
      id: "ev2",
      date: addDaysISO(today, 1),
      title: "Quiz: Sistema Solar",
      type: "QUIZ",
      courseName: "Ciencias",
    },
    {
      id: "ev3",
      date: addDaysISO(today, 3),
      title: "Entrega: Guía de ejercicios",
      type: "DEADLINE",
      courseName: "Matemáticas",
    },
    {
      id: "ev4",
      date: addDaysISO(today, 6),
      title: "Evaluación: Comprensión lectora",
      type: "EXAM",
      courseName: "Lenguaje",
    },
    {
      id: "ev5",
      date: addDaysISO(today, 10),
      time: "19:00",
      title: "Recordatorio: repasar módulo 2",
      type: "REMINDER",
      courseName: "Historia",
    },
  ];
}

export async function getStudentNotificationsMock(): Promise<StudentNotification[]> {
  await new Promise((r) => setTimeout(r, 120));
  const today = new Date();

  return [
    {
      id: "nt1",
      createdAt: addDaysISO(today, 0),
      title: "Tienes una clase hoy",
      message: "Matemáticas • Clase en vivo a las 18:30.",
      level: "INFO",
      actionLabel: "Ver curso",
      actionTo: "/estudiante/cursos/c1",
    },
    {
      id: "nt2",
      createdAt: addDaysISO(today, 0),
      title: "Entrega próxima",
      message: "Guía de ejercicios vence en 3 días (Matemáticas).",
      level: "WARNING",
      actionLabel: "Ir al calendario",
      actionTo: "/estudiante",
    },
    {
      id: "nt3",
      createdAt: addDaysISO(today, -1),
      title: "Buen avance",
      message: "Completaste un módulo esta semana. Mantén la racha.",
      level: "SUCCESS",
    },
    {
      id: "nt4",
      createdAt: addDaysISO(today, -2),
      title: "Rendimiento bajo en Lenguaje",
      message: "Tu promedio va en 4.9. Recomendación: repasar lecturas y ejercicios.",
      level: "DANGER",
      actionLabel: "Ver ranking",
      actionTo: "/estudiante",
    },
  ];
}