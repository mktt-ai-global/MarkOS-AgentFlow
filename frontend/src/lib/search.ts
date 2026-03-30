type SearchableValue = string | number | boolean | null | undefined;

export function normalizeSearchQuery(query: string) {
  return query.trim().toLowerCase();
}

export function hasSearchQuery(query: string) {
  return normalizeSearchQuery(query).length > 0;
}

export function filterByQuery<T>(
  items: readonly T[],
  query: string,
  getFields: (item: T) => SearchableValue[]
) {
  const normalizedQuery = normalizeSearchQuery(query);

  if (!normalizedQuery) {
    return [...items];
  }

  return items.filter((item) =>
    getFields(item).some((field) =>
      String(field ?? "")
        .toLowerCase()
        .includes(normalizedQuery)
    )
  );
}

export function getSearchMeta(query: string, count: number, fallback: string, unit = "项") {
  if (!hasSearchQuery(query)) {
    return fallback;
  }

  return `匹配 ${count} ${unit}`;
}
