export const formatUserAdminDate = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleString();
};

export const labelUserRole = (role) =>
  String(role || "").replaceAll("_", " ");
