import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Math Islands — Математика аралдары" },
      { name: "description", content: "Bilingual (KZ/RU) math games for grades 4–6: fractions, percent, equations and more." },
      { property: "og:title", content: "Math Islands — Математика аралдары" },
      { property: "og:description", content: "Bilingual math games and animations for grades 4–6." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

// The app itself is a plain HTML/JS static site in public/app/.
function Index() {
  useEffect(() => {
    window.location.replace("/app/index.html");
  }, []);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <a href="/app/index.html" className="text-foreground underline">Math Islands</a>
    </div>
  );
}
