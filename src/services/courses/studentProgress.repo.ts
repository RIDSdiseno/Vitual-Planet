import type { CourseWithModules, StudentCourseProgress } from "./studentProgress.types";

export interface StudentProgressRepo {
  getCourses(): Promise<CourseWithModules[]>;
  getCourseById(courseId: string): Promise<CourseWithModules | null>;
  getProgress(
    userId: string,
    courseId: string
  ): Promise<StudentCourseProgress | null>;
  markModuleDone(
    userId: string,
    courseId: string,
    moduleId: string
  ): Promise<StudentCourseProgress>;
}