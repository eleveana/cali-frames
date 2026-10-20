# Cali Frames

Maya’s California city poster storefront. Static HTML, CSS, and JavaScript, with 15 city designs, search, region filters, product previews, a cart with Shopify checkout, and custom poster orders.

## Run locally

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. No dependency installation or build step is needed.

## Deploy to Vercel

Import this repository, select **Other** for the framework, leave the build command empty, and set the output directory to `dist`. The included configuration maps `/about`, `/how-it-works`, and `/custom` to the matching HTML pages.

## Edit

- `dist/index.html`: homepage and product dialog
- `dist/about.html`: Maya’s story
- `dist/how-it-works.html`: ordering steps
- `dist/custom.html` and `dist/custom.js`: custom poster order form
- `dist/style.css`: branding and responsive styles
- `dist/app.js`: catalog, browsing, and cart
- `dist/shopify.js`: Shopify store connection and checkout
- `dist/assets/`: logo, poster images, and collection photograph

## Shopify

The site connects to the Shopify store `cali-frame-creations-iu5wz.myshopify.com` through the Storefront API (settings at the top of `dist/shopify.js`). Checkout happens on Shopify; the cart lives in the browser until then.

- **Selling a city poster online:** in Shopify admin, create a product with handle `<city-slug>-poster` (e.g. `oceanside-poster`, `la-jolla-poster`; slugs are in `dist/products.json`), add size variants with prices, and make it available on the sales channel the Storefront token uses. The site picks it up automatically: the card shows the price, the product dialog shows sizes, and it checks out on Shopify. The frame choice is sent as a `Frame` line item property.
- **City posters not in Shopify yet** stay as “price by email” inquiries to hello@califrames.com.
- **Custom posters** check out as the Shopify product with handle `custom-poster`; the customer’s answers appear as line item properties on the order. Customers email their own photo if they want to be in the poster.

The ChatGPT Sites copy is deployed separately; changes here do not automatically update that copy.
