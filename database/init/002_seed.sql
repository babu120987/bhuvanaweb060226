BEGIN;

INSERT INTO categories (slug, name, description, display_order) VALUES
  ('floral', 'Floral', 'Jasmine, tuberose, rose and soft vanilla compositions.', 1),
  ('fresh', 'Fresh', 'Citrus, vetiver, sea salt and polished woods.', 2),
  ('woody', 'Woody', 'Oud, amber, patchouli and evening compositions.', 3),
  ('sets', 'Discovery & Gifts', 'Discovery wardrobes and considered fragrance pairings.', 4)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO products
  (category_id, slug, sku, name, short_description, scent_family, concentration, size_ml, price_paise, compare_at_price_paise, featured)
VALUES
  ((SELECT id FROM categories WHERE slug='floral'), 'madurai-jasmine', 'BUVA-MJ-050', 'Madurai Jasmine', 'Jasmine, orange blossom and vanilla.', 'floral', 'Eau de Parfum', 50, 149000, 165000, TRUE),
  ((SELECT id FROM categories WHERE slug='fresh'), 'coastal-vetiver', 'BUVA-CV-050', 'Coastal Vetiver', 'Bergamot, vetiver and soft woods.', 'fresh', 'Eau de Parfum', 50, 169000, NULL, TRUE),
  ((SELECT id FROM categories WHERE slug='woody'), 'rose-oud', 'BUVA-RO-050', 'Rose Oud', 'Rose, saffron and oud.', 'woody', 'Parfum', 50, 219000, NULL, TRUE),
  ((SELECT id FROM categories WHERE slug='floral'), 'royal-tuberose', 'BUVA-RT-050', 'Royal Tuberose', 'Tuberose, coconut milk and musk.', 'floral', 'Eau de Parfum', 50, 189000, NULL, FALSE),
  ((SELECT id FROM categories WHERE slug='woody'), 'midnight-patchouli', 'BUVA-MP-050', 'Midnight Patchouli', 'Patchouli, amber and cacao.', 'woody', 'Parfum', 50, 219000, NULL, FALSE),
  ((SELECT id FROM categories WHERE slug='fresh'), 'sandalwood-coast', 'BUVA-SC-050', 'Sandalwood Coast', 'Lemon, sandalwood and sea salt.', 'fresh', 'Eau de Parfum', 50, 169000, NULL, FALSE),
  ((SELECT id FROM categories WHERE slug='floral'), 'rare-vanilla', 'BUVA-RV-050', 'Rare Vanilla', 'Vanilla, heliotrope and tonka.', 'floral', 'Eau de Parfum', 50, 149000, NULL, FALSE),
  ((SELECT id FROM categories WHERE slug='sets'), 'discovery-wardrobe', 'BUVA-DW-012', 'Discovery Wardrobe', 'Six fragrances in 2 ml vials.', 'sets', 'Discovery Set', 12, 99000, 120000, TRUE),
  ((SELECT id FROM categories WHERE slug='sets'), 'chennai-after-dark', 'BUVA-CAD-100', 'Chennai After Dark', 'Rose Oud and Midnight Patchouli duo.', 'sets', 'Gift Set', 100, 359000, 438000, FALSE)
ON CONFLICT (slug) DO UPDATE SET
  category_id = EXCLUDED.category_id,
  sku = EXCLUDED.sku,
  name = EXCLUDED.name,
  short_description = EXCLUDED.short_description,
  scent_family = EXCLUDED.scent_family,
  concentration = EXCLUDED.concentration,
  size_ml = EXCLUDED.size_ml,
  price_paise = EXCLUDED.price_paise,
  compare_at_price_paise = EXCLUDED.compare_at_price_paise,
  featured = EXCLUDED.featured;

INSERT INTO product_images (product_id, image_url, alt_text, display_order)
SELECT id,
  CASE scent_family
    WHEN 'floral' THEN '/img/buva/madurai-jasmine.png'
    WHEN 'fresh' THEN '/img/buva/fresh-vetiver.png'
    WHEN 'woody' THEN '/img/buva/rose-oud.png'
    ELSE '/img/buva/campaign-hero.png'
  END,
  name || ' fragrance by Buva Chennai',
  0
FROM products
ON CONFLICT (product_id, display_order) DO UPDATE SET image_url = EXCLUDED.image_url, alt_text = EXCLUDED.alt_text;

INSERT INTO inventory (product_id, quantity, reserved_quantity, low_stock_threshold)
SELECT id, CASE WHEN scent_family = 'sets' THEN 20 ELSE 40 END, 0, 5 FROM products
ON CONFLICT (product_id) DO NOTHING;

INSERT INTO coupons (code, discount_type, discount_value, minimum_order_paise, usage_limit, active)
VALUES ('WELCOME10', 'percentage', 10, 150000, 500, TRUE)
ON CONFLICT (code) DO NOTHING;

COMMIT;
