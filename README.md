# Cali Frames

Maya’s California city poster storefront. Static HTML, CSS, and JavaScript, with 15 city designs, search, region filters, product previews, saved picks, and email order inquiries.

## Run locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No dependency installation or build step is needed.

## Deploy to Vercel

Import this repository, select **Other** for the framework, leave the build command empty, and set the output directory to `dist`. The included configuration maps `/about` and `/how-it-works` to the matching HTML pages.

## Edit

- `dist/index.html`: homepage and product dialog
- `dist/about.html`: Maya’s story
- `dist/how-it-works.html`: ordering steps
- `dist/style.css`: branding and responsive styles
- `dist/app.js`: catalog and browsing interactions
- `dist/assets/`: logo, poster images, and collection photograph

Orders currently open an email inquiry to hello@califrames.com. Online payment, inventory, and order management are not implemented.

The ChatGPT Sites copy is deployed separately; changes here do not automatically update that copy.
