"use server";

export type ReadwiseHighlight = {
  id: number;
  text: string;
  note: string;
  book_id: number;
  book_title: string;
  highlighted_at: string;
  url: string | null;
};

export type ReadwiseFetchResult = {
  highlights: ReadwiseHighlight[];
  error?: string;
};

async function fetchAllPages<T>(
  url: string,
  headers: Record<string, string>
): Promise<T[]> {
  const all: T[] = [];
  let next: string | null = url;
  while (next) {
    const res = await fetch(next, { headers, cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    const data = (await res.json()) as { results: T[]; next: string | null };
    all.push(...data.results);
    next = data.next;
  }
  return all;
}

export async function fetchReadwiseHighlights(
  apiKey: string,
  updatedGt?: string
): Promise<ReadwiseFetchResult> {
  if (!apiKey.trim()) return { highlights: [], error: "API key is required" };

  const headers = { Authorization: `Token ${apiKey}` };

  try {
    // Fetch books for title mapping
    const books = await fetchAllPages<{
      id: number;
      title: string;
    }>("https://readwise.io/api/v2/books/?page_size=1000", headers);
    const bookMap = new Map(books.map((b) => [b.id, b.title]));

    // Fetch highlights, optionally filtered since last sync
    const params = new URLSearchParams({ page_size: "1000" });
    if (updatedGt) params.set("updated__gt", updatedGt);

    const raw = await fetchAllPages<{
      id: number;
      text: string;
      note: string;
      book_id: number;
      highlighted_at: string;
      url: string | null;
    }>(`https://readwise.io/api/v2/highlights/?${params}`, headers);

    const highlights: ReadwiseHighlight[] = raw.map((h) => ({
      id: h.id,
      text: h.text,
      note: h.note ?? "",
      book_id: h.book_id,
      book_title: bookMap.get(h.book_id) ?? "Readwise",
      highlighted_at: h.highlighted_at,
      url: h.url,
    }));

    return { highlights };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg === "401")
      return {
        highlights: [],
        error: "Invalid API key. Check your Readwise token.",
      };
    return { highlights: [], error: `Sync failed: ${msg}` };
  }
}
