/**
 * Static export so the whole site can be served from GitHub Pages.
 * A project page lives under /<repo>, so asset paths need a basePath; the
 * deploy workflow sets NEXT_PUBLIC_BASE_PATH and local dev leaves it empty.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** @type {import('next').NextConfig} */
export default {
  output: "export",
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  trailingSlash: true,
};
