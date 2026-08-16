# Buva storefront

Customer-facing HTML, CSS, JavaScript and optimized campaign assets live here.
The storefront is served by Nginx and loads its product cards from the
ecommerce API at `/api/products`. Built-in product markup remains as a graceful
fallback if the API is temporarily unavailable.

The bag is backed by PostgreSQL through `/api/carts`. A guest cart token is kept
in browser local storage so quantities follow the shopper across pages and
browser refreshes. The shared JavaScript injects the accessible cart drawer on
every storefront page.
