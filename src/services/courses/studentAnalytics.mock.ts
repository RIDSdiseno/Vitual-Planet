export type SubjectPerformance = {
  courseId: string;
  name: string;
  average: number; // 1 a 7
  progress: number; // %
};

export type StudentAnalytics = {
  globalAverage: number;
  streakDays: number;
  subjects: SubjectPerformance[];
};

export async function getStudentAnalyticsMock(): Promise<StudentAnalytics> {
  await new Promise((r) => setTimeout(r, 150));

  const subjects: SubjectPerformance[] = [
    { courseId: "c1", name: "Matemáticas", average: 6.3, progress: 75 },
    { courseId: "c2", name: "Ciencias", average: 5.8, progress: 100 },
    { courseId: "c3", name: "Lenguaje", average: 4.9, progress: 40 },
    { courseId: "c4", name: "Historia", average: 5.2, progress: 60 },
  ];

  const globalAverage =
    subjects.reduce((acc, s) => acc + s.average, 0) / subjects.length;

  return {
    globalAverage: Number(globalAverage.toFixed(2)),
    streakDays: 6,
    subjects,
  };
}