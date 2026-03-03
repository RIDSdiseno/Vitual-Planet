import type { StudentProgressRepo } from "./studentProgress.repo";
import type { CourseWithModules, StudentCourseProgress } from "./studentProgress.types";

const COURSES: CourseWithModules[] = [
  {
    id: "c1",
    titulo: "Matemáticas 6°",
    status: "PUBLICADO",
    updatedAt: "2026-02-20",
    modules: [
      { id: "m1", courseId: "c1", order: 1, title: "Fracciones" },
      { id: "m2", courseId: "c1", order: 2, title: "Ecuaciones lineales" },
      { id: "m3", courseId: "c1", order: 3, title: "Problemas" },
    ],
  },
  {
    id: "c2",
    titulo: "Ciencias 6°",
    status: "PUBLICADO",
    updatedAt: "2026-02-22",
    modules: [
      { id: "m1", courseId: "c2", order: 1, title: "Sistema solar" },
      { id: "m2", courseId: "c2", order: 2, title: "Energía" },
    ],
  },
];

const PROGRESS: StudentCourseProgress[] = [
  { userId: "u_student", courseId: "c1", completedModuleIds: ["m1"], completedAt: null },
  { userId: "u_student", courseId: "c2", completedModuleIds: ["m1", "m2"], completedAt: "2026-02-25" },
];

function todayISO() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export const studentProgressRepoMock: StudentProgressRepo = {
  async getCourses() {
    await new Promise((r) => setTimeout(r, 120));
    return [...COURSES];
  },

  async getCourseById(courseId) {
    await new Promise((r) => setTimeout(r, 120));
    return COURSES.find((c) => c.id === courseId) ?? null;
  },

  async getProgress(userId, courseId) {
    await new Promise((r) => setTimeout(r, 120));
    return PROGRESS.find((p) => p.userId === userId && p.courseId === courseId) ?? null;
  },

  async markModuleDone(userId, courseId, moduleId) {
    await new Promise((r) => setTimeout(r, 120));

    const course = COURSES.find((c) => c.id === courseId);
    if (!course) throw new Error("Course not found");

    let row = PROGRESS.find((p) => p.userId === userId && p.courseId === courseId);
    if (!row) {
      row = { userId, courseId, completedModuleIds: [], completedAt: null };
      PROGRESS.push(row);
    }

    if (!row.completedModuleIds.includes(moduleId)) row.completedModuleIds.push(moduleId);

    const allDone = course.modules.every((m) => row!.completedModuleIds.includes(m.id));
    row.completedAt = allDone ? todayISO() : null;

    return { ...row };
  },
};