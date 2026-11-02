export function setPageMetadata(title: string, description?: string) {
  document.title = `${title} | DevNest`;
  if (!description) return;

  let descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
  if (!descriptionMeta) {
    descriptionMeta = document.createElement("meta");
    descriptionMeta.name = "description";
    document.head.appendChild(descriptionMeta);
  }
  descriptionMeta.content = description;
}
