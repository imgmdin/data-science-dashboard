export const BRAND = {
  portal: "Cabinet Portal",
  society: "Data Science Society",
  // Product name, reserved for later use (not shown in the UI yet).
  system: "SMS — Society Management System",
};

// Where the public portal lives. Set NEXT_PUBLIC_PUBLIC_SITE_URL (and redeploy) on Vercel;
// localhost is only a development fallback, so production never links to it.
export const PUBLIC_URL = (
  process.env.NEXT_PUBLIC_PUBLIC_SITE_URL ?? (process.env.NODE_ENV === "production" ? "" : "http://localhost:3001")
).replace(/\/+$/, "");
