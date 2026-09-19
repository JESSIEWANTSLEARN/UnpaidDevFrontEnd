export const number = (value) =>
  Number(value || 0).toLocaleString();

export const money = (value) =>
  new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(Number(value || 0));

export const date = (value) => {
  if (!value) return "-";

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? String(value)
    : parsed.toLocaleString();
};
