export function resolveClassFromQuery(query, classes) {
  const q = String(query || "").trim().toLowerCase();
  if (!q || !classes?.length) return null;

  const exact = classes.find((c) => String(c.name || "").trim().toLowerCase() === q);
  if (exact) return exact;

  const prefixMatches = classes.filter((c) => String(c.name || "").trim().toLowerCase().startsWith(q));
  if (prefixMatches.length === 1) return prefixMatches[0];

  const containsMatches = classes.filter((c) => String(c.name || "").trim().toLowerCase().includes(q));
  if (containsMatches.length === 1) return containsMatches[0];

  return null;
}

export function sortStudentsByClassAndName(rows) {
  return [...rows].sort((a, b) => {
    const byClass = (a.className || "").localeCompare(b.className || "", "tr");
    if (byClass !== 0) return byClass;
    return (a.fullName || "").localeCompare(b.fullName || "", "tr");
  });
}

export function buildStudentListParams({ query, onlyActive, classes }) {
  const trimmed = String(query || "").trim();
  const matchedClass = resolveClassFromQuery(trimmed, classes);
  const params = { onlyActive, limit: 100 };

  if (matchedClass) {
    params.classId = matchedClass.id;
    return { params, matchedClass, mode: "class" };
  }

  if (trimmed) {
    params.q = trimmed;
    return { params, matchedClass: null, mode: "search" };
  }

  return { params, matchedClass: null, mode: "all" };
}
