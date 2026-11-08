export interface PageMetaOptions {
  title: string;
  description?: string;
  image?: string;
  type?: "website" | "article";
}

function setMetaTag(selector: string, attrName: string, attrValue: string, content: string) {
  let meta = document.querySelector<HTMLMetaElement>(selector);
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute(attrName, attrValue);
    document.head.appendChild(meta);
  }
  meta.content = content;
}

export function setPageMetadata(titleOrOptions: string | PageMetaOptions, maybeDescription?: string) {
  const options: PageMetaOptions =
    typeof titleOrOptions === "string"
      ? { title: titleOrOptions, description: maybeDescription }
      : titleOrOptions;

  const fullTitle = `${options.title} | DevNest`;
  document.title = fullTitle;

  const desc = options.description || "DevNest — Cộng đồng dành cho developer Việt Nam & quốc tế";
  setMetaTag('meta[name="description"]', "name", "description", desc);

  // OpenGraph tags
  setMetaTag('meta[property="og:title"]', "property", "og:title", fullTitle);
  setMetaTag('meta[property="og:description"]', "property", "og:description", desc);
  setMetaTag('meta[property="og:type"]', "property", "og:type", options.type ?? "article");
  setMetaTag('meta[property="og:url"]', "property", "og:url", window.location.href);

  if (options.image) {
    setMetaTag('meta[property="og:image"]', "property", "og:image", options.image);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", options.image);
  }

  // Twitter Card
  setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", options.image ? "summary_large_image" : "summary");
  setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", fullTitle);
  setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", desc);
}
