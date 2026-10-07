<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Math Islands lives as a plain HTML/CSS/JS static site in public/app/ (no frameworks, classic scripts) so it opens offline by double-clicking index.html; "/" just redirects there.
- AI explanations go through the public server route /api/public/explain (input length-capped, math-only prompt) because the static app has no login and cannot use server functions; the rest of the app stays offline-capable.
- Installability is manifest-only (public/app/manifest.webmanifest); this template forbids adding PWA/service-worker build config.
