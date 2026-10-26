// Client-safe member type (no database imports).
export type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "Active" | "Pending" | "Inactive";
  isCabinet: boolean;
};
