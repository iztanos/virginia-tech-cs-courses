import { marked } from "marked";

const REPO = "https://github.com/tanushn-hub/virginia-tech-cs-courses/blob/main/docs/";

/**
 * The guide's prose links to sibling markdown files. On the site those need to
 * become routes: a "#cs-3214-..." anchor is a course page, anything else falls
 * back to the file on GitHub so the link never dead-ends.
 */
function rewriteLinks(md: string): string {
  return md
    .replace(/\]\((?:\.\.\/)?\d{4}-level\.md#(cs-\d{4})[a-z0-9-]*\)/g, "](/courses/$1/)")
    .replace(/\]\(\.\.\/README\.md\)/g, "](/)")
    .replace(/\]\((?:\.\.\/)?(professors|tracks|methodology)\.md(#[a-z0-9-]*)?\)/g, `](${REPO}$1.md$2)`);
}

export function renderMarkdown(md: string): string {
  return marked.parse(rewriteLinks(md), { async: false, gfm: true }) as string;
}

export function renderInline(md: string): string {
  return marked.parseInline(rewriteLinks(md), { async: false }) as string;
}
