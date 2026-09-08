export function pageHead({
  title,
  description,
  path,
  type = "website",
}: {
  title: string;
  description: string;
  path: string;
  type?: string;
}) {
  const full = `${title} | The Ali's Collegiate`;
  return {
    meta: [
      { title: full },
      { name: "description", content: description },
      { property: "og:title", content: full },
      { property: "og:description", content: description },
      { property: "og:type", content: type },
      { property: "og:url", content: path },
    ],
    links: [{ rel: "canonical", href: path }],
  };
}