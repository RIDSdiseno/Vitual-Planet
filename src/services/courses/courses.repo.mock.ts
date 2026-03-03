import type { CoursesRepo } from "./courses.repo";
import type { Course } from "./courses.types";
import { COURSES_MOCK } from "./courses.mock";

export const coursesRepoMock: CoursesRepo = {
  async list() {
    await new Promise((r) => setTimeout(r, 250));
    return [...COURSES_MOCK] as Course[];
  },
};
