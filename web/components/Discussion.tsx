import type { RedditThread } from "@/lib/data";

/** Links out to r/VirginiaTech threads; excerpts stay short by design. */
export default function Discussion({ threads }: { threads: RedditThread[] }) {
  if (!threads.length) return null;

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold">Discussion on r/VirginiaTech</h2>

      <ul className="mt-3 space-y-3">
        {threads.map((t) => (
          <li key={t.id}>
            <a
              href={t.permalink}
              target="_blank"
              rel="noreferrer"
              className="font-medium text-maroon underline-offset-2 hover:underline dark:text-orange"
            >
              {t.title}
            </a>
            <div className="text-xs text-neutral-500">
              {t.created} · {t.score} points · {t.num_comments} comments
              {t.flair ? ` · ${t.flair}` : ""}
            </div>
            {t.excerpt && (
              <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">{t.excerpt}</p>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-neutral-500">
        Search results from r/VirginiaTech, ranked by relevance. Unvetted student opinion &mdash;
        read the threads, not the excerpts.
      </p>
    </section>
  );
}
