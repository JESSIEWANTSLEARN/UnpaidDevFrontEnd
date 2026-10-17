export function filterOrders(orders, { query = "", sort = "newest" } = {}) {
  const needle = query.trim().toLowerCase();
  const matches = orders.filter((order) => !needle || [
    order.order_id,
    order.status,
    ...(order.items ?? []).flatMap((item) => [item.product_name, item.sku]),
  ].some((value) => String(value ?? "").toLowerCase().includes(needle)));
  if (sort !== "default") {
    const direction = sort === "oldest" ? 1 : -1;
    matches.sort((a, b) => direction * (new Date(a.order_date).getTime() - new Date(b.order_date).getTime()));
  }
  return matches;
}

export function filterReviews(reviews, { query = "", rating = "all", sort = "newest" } = {}) {
  const needle = query.trim().toLowerCase();
  const matches = reviews.filter((review) =>
    (rating === "all" || Number(review.rating) === Number(rating))
    && (!needle || [review.product_name, review.sku, review.title, review.comment].some((value) => String(value ?? "").toLowerCase().includes(needle)))
  );
  if (sort === "highest") matches.sort((a, b) => Number(b.rating) - Number(a.rating));
  if (sort === "lowest") matches.sort((a, b) => Number(a.rating) - Number(b.rating));
  if (sort === "newest" || sort === "oldest") {
    const direction = sort === "oldest" ? 1 : -1;
    matches.sort((a, b) => direction * (Number(a.review_id) - Number(b.review_id)));
  }
  return matches;
}
