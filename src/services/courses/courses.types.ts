export type CourseStatus = "BORRADOR" | "PUBLICADO" | "ARCHIVADO";

export type Course = {
  id: string;
  titulo: string;
  status: CourseStatus;
  updatedAt: string;
};
