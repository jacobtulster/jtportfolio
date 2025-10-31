# UX Portfolio Template

This is a lightweight, accessible, static portfolio for a UK‑based UX/Product Designer. It includes responsive layout, dynamic project cards, and basic SEO/Schema.

## Structure

- `index.html` — main page
- `assets/styles.css` — styles
- `assets/script.js` — enhancement (menu, projects)
- `assets/projects.json` — your projects data
- `assets/favicon.svg` — favicon (replace as needed)
- `assets/og-image.png` — optional social preview (add your own)
- `assets/JacobThompson-CV.pdf` — optional CV file (add your own)

## Edit content

1. Open `assets/projects.json` and edit or add case studies.
2. Update copy in `index.html` (name, email, links, about).
3. Replace `assets/og-image.png` and `assets/favicon.svg` if desired.
4. Drop your CV at `assets/JacobThompson-CV.pdf`.

## Local preview

Open `index.html` directly in the browser, or serve with a static server to avoid JSON fetch issues.

For example (PowerShell):

```powershell
npx serve . -l 3000 --single
```

Then visit `http://localhost:3000`.

## Deploy to GitHub Pages

1. Create a new GitHub repo and push this folder.
2. In GitHub, go to Settings → Pages.
3. Build and deployment → Source → Deploy from a branch.
4. Branch: `main` (or `master`), Folder: `/ (root)`.
5. Save. Your site will be at `https://<username>.github.io/<repo>/`.

### Use a custom domain

1. In GitHub Pages → Custom domain: enter your domain (e.g., `www.example.co.uk`).
2. In your domain DNS, add:
   - CNAME for `www` → `<username>.github.io.`
   - Optional root (apex) domain: set A records to `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (GitHub Pages IPs) and add an ALIAS/ANAME if your DNS supports it.
3. Enable Enforce HTTPS.

If you deploy to the repo root, GitHub will create/expect a `CNAME` file automatically once you set the custom domain in settings.

## Alternatives

- Netlify or Vercel for quick deploys, preview URLs, and free SSL. Connect your repo and set output as the repo root.

## Accessibility & performance

- Skip‑link, reduced motion, semantic structure, and high‑contrast defaults included.
- Keep images compressed, provide alt text if you add `<img>` tags.
- Prefer `.webp` for preview images.


