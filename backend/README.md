# Buva backend

Node.js service tier with a pooled PostgreSQL connection. The `/health`
endpoint verifies both the API process and its live database connection.

Catalogue endpoints:

- `GET /api/categories`
- `GET /api/products`
- `GET /api/products?family=floral`
- `GET /api/products?featured=true&limit=3`
- `GET /api/products/:slug`

Prices are returned in paise. Product lists include the primary image and
currently available inventory quantity.

Guest cart endpoints:

- `POST /api/carts`
- `GET /api/carts/:sessionToken`
- `POST /api/carts/:sessionToken/items` with `{ "productId": 1, "quantity": 1 }`
- `PATCH /api/carts/:sessionToken/items/:productId` with `{ "quantity": 2 }`
- `DELETE /api/carts/:sessionToken/items/:productId`
- `POST /api/carts/:sessionToken/checkout`

Cart mutations are transactional. Product state, available inventory and the
20-unit per-item limit are validated by the backend, and all prices and totals
are calculated from the current database values.

Checkout accepts customer contact details, an Indian shipping address, an
optional coupon code and cash-on-delivery payment. Order creation locks the cart
and inventory in one transaction, recalculates totals, records order line
prices, decrements inventory and converts the cart. Delivery is ₹99 below
₹1,500 and complimentary from ₹1,500. The seeded `WELCOME10` coupon applies a
10% discount to qualifying orders.

Admin order endpoints require the `X-Admin-Key` header matching
`ADMIN_API_KEY`:

- `GET /api/admin/orders`
- `GET /api/admin/orders/:id`
- `PATCH /api/admin/orders/:id/status` with `{ "status": "confirmed" }`
- `GET /api/admin/products`
- `GET /api/admin/products?active=true&lowStock=true`
- `POST /api/admin/products`
- `PATCH /api/admin/products/:id`
- `GET /api/admin/catalog/categories`

Status transitions follow the fulfilment lifecycle. Cancelling or returning an
order restores its line-item inventory within the same database transaction.
Product writes validate catalogue fields, prices and inventory on the server.
Products are archived by setting `active` to false rather than deleting order
history, and stock cannot be set below reserved inventory.

Customer account endpoints:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/account`
- `POST /api/account/addresses`

Customer sessions use random bearer tokens stored as SHA-256 hashes, and
passwords use salted scrypt hashes. Authenticated checkout links the order to
the customer and can save the delivery address. Registration requires a full
name, email address, phone number and password; sign-in accepts either the
registered email address or phone number with the password.

Razorpay Standard Checkout:

- configure `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- configure a separate `RAZORPAY_WEBHOOK_SECRET`
- set the Razorpay webhook URL to `/api/payments/razorpay/webhook` on the public
  HTTPS deployment
- enable automatic capture in the Razorpay dashboard

The server creates the Razorpay order, verifies the Checkout HMAC against its
stored provider order ID, fetches the payment to confirm it is captured for the
correct INR amount, and also processes signed, idempotent payment webhooks.
The secret key is never returned to the browser.
