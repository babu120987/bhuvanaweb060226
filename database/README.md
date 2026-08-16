# Buva PostgreSQL database

The database image runs the SQL files in `init/` in filename order when a new
PostgreSQL volume is created.

- `001_schema.sql` creates ecommerce tables, constraints, indexes and triggers.
- `002_seed.sql` adds the initial Buva product catalogue, inventory and coupon.
- `003_accounts_payments.sql` adds customer sessions, Razorpay payment records,
  webhook idempotency and the Razorpay order payment method.

Docker stores data in the named `buva_postgres_data` volume. SQL initialization
files do not rerun against an existing volume; future changes should be added as
versioned migrations rather than editing production data manually.
