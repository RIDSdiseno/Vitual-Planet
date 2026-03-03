export type TenantType = "SCHOOL" | "SOLO_TEACHER";
export type TenantStatus = "TRIAL" | "ACTIVE" | "PAST_DUE" | "SUSPENDED";
export type Plan = "BASIC" | "PRO" | "ENTERPRISE";

export type Tenant = {
  id: string;
  type: TenantType;
  name: string;
  city?: string;
  country?: string;

  status: TenantStatus;
  plan: Plan;

  ownerName: string;
  ownerEmail: string;

  metrics: {
    students: number;
    teachers: number;
    courses: number;
  };

  billing: {
    currency: "CLP" | "USD";
    mrr: number; // mensual
    nextInvoiceDate: string; // YYYY-MM-DD
  };

  createdAt: string; // YYYY-MM-DD
};

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};
