// Shopify Storefront API connection. The Storefront token is a public,
// read-and-checkout-only key that Shopify designs to live in browser code.
const SHOPIFY_DOMAIN = 'cali-frame-creations-iu5wz.myshopify.com';
const SHOPIFY_TOKEN = 'd80866a5415721020fd8292d2df97c8a';
const SHOPIFY_API = `https://${SHOPIFY_DOMAIN}/api/2025-07/graphql.json`;
const CUSTOM_POSTER_HANDLE = 'custom-poster';

async function storefront(query, variables = {}) {
  const res = await fetch(SHOPIFY_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': SHOPIFY_TOKEN },
    body: JSON.stringify({ query, variables }),
  });
  if (!res.ok) throw new Error(`Shopify HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(json.errors.map((e) => e.message).join(', '));
  return json.data;
}

const PRODUCTS_QUERY = `{
  products(first: 250) {
    edges { node {
      handle title availableForSale
      variants(first: 20) { edges { node { id title availableForSale price { amount currencyCode } } } }
    } }
  }
}`;

let catalogPromise;

// Returns a Map of handle -> { title, variants: [{ id, title, price, available }] }.
// A city poster is sold online when Shopify has a product whose handle is
// the city slug or the slug plus "-poster" (e.g. "oceanside-poster").
function loadCatalog() {
  catalogPromise ??= storefront(PRODUCTS_QUERY).then((data) => {
    const catalog = new Map();
    for (const { node } of data.products.edges) {
      const variants = node.variants.edges
        .map(({ node: v }) => ({ id: v.id, title: v.title, price: Number(v.price.amount), available: v.availableForSale }))
        .filter((v) => v.available && v.price > 0);
      if (node.availableForSale && variants.length) catalog.set(node.handle, { title: node.title, variants });
    }
    return catalog;
  });
  return catalogPromise;
}

function findProduct(catalog, slug) {
  return catalog.get(slug) || catalog.get(`${slug}-poster`) || null;
}

const CART_CREATE = `mutation cartCreate($input: CartInput!) {
  cartCreate(input: $input) { cart { id checkoutUrl } userErrors { message } }
}`;

// lines: [{ variantId, quantity, attributes: [{ key, value }] }]
// Returns { id, url }; send the shopper to url.
async function createCheckout(lines) {
  const data = await storefront(CART_CREATE, {
    input: {
      lines: lines.map((l) => ({
        merchandiseId: l.variantId,
        quantity: l.quantity || 1,
        attributes: (l.attributes || []).filter((a) => a.value && a.value.trim()),
      })),
    },
  });
  const { cart, userErrors } = data.cartCreate;
  if (userErrors.length || !cart) throw new Error(userErrors.map((e) => e.message).join(', ') || 'No cart');
  const url = new URL(cart.checkoutUrl);
  url.searchParams.set('channel', 'online_store');
  return { id: cart.id, url: url.toString() };
}

// Shopify stops returning a cart once its order is placed.
async function cartIsCompleted(id) {
  const data = await storefront(`query($id: ID!) { cart(id: $id) { id } }`, { id });
  return !data.cart;
}

const money = (n) => `$${n % 1 ? n.toFixed(2) : n}`;
