import type { Course } from "./courses.types";

export interface CoursesRepo {
  list(): Promise<Course[]>;
}
