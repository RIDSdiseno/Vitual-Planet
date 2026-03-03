import type { Course } from "./courses.types";

export type CourseModule = {
  id: string;
  courseId: string;
  order: number;
  title: string;

  // opcional para el futuro (contenido / tipo / etc.)
  kind?: "CONTENT" | "ACTIVITY" | "QUIZ";
};

export type CourseWithModules = Course & {
  modules: CourseModule[];
};

export type StudentCourseProgress = {
  userId: string;
  courseId: string;
  completedModuleIds: string[];
  completedAt?: string | null;
};