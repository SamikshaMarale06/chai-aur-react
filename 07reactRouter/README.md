# ProductHub

ProductHub is a React product-sharing app built with Vite, React Router, and Tailwind CSS. Product records are persisted to the root `product.json` file by the included Node.js API.

## Run locally

Use Node.js 18 or newer. From this folder, install dependencies once:

```bash
npm install
```

Open two terminals in this folder:

```bash
npm run server
```

```bash
npm run dev
```

Open the local URL printed by Vite. Keep both terminals running while using the app. The API listens on `http://127.0.0.1:3001`, and Vite proxies `/api` requests to it.

## Product data

Submitting the product form sends a `POST /api/products` request. The API validates the product and writes it to `product.json`; the Product page reads saved products from `GET /api/products`. Keep `product.json` writable and do not stop the API while submitting or viewing products.

Seeded product photographs are stored in `public/images` and referenced by each record's `image` field. The `link` field remains the product destination; when it is not a direct image URL, the card uses a category photograph instead.

## Checks

```bash
npm run build
npm run lint
npm test
```
