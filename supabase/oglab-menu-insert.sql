-- OG Lab Menu Data Migration
-- Generated from Google Sheets on 2025-09-21T01:53:41.243Z
-- Total items: 40
-- ВАЖНО: Этот скрипт НЕ УДАЛЯЕТ существующие данные, только добавляет новые

BEGIN;

-- Добавляем товары из Google Sheets (без удаления существующих)
INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Runtz', 'hybrid', 21, NULL, NULL, NULL, 196, 120, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Big Detroit Energy', 'indica', 19, NULL, NULL, NULL, 196, 120, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Marmalade', 'hybrid', 16, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Grand Master Sexy', 'indica', 21, NULL, NULL, NULL, 196, 120, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Super Boof', 'hybrid', 24, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'L.A. Banana Cake', 'hybrid', 20, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Lemon Cherry Gelato', 'hybrid', 20, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Lemon Berry Candy OG', 'sativa', 25, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Tropicana Cherry', 'sativa', 21, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Early Lemon Berry', 'sativa', 13, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('TOP SHELF', 'Mac 1', 'hybrid', 22, NULL, NULL, NULL, 196, 120, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('MID SHELF', 'White Widow', 'sativa', 22, NULL, NULL, NULL, 157, 96, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('MID SHELF', 'Pineapple Haze', 'sativa', 16, NULL, NULL, NULL, 157, 96, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('MID SHELF', 'Jack Herer', 'sativa', 20, NULL, NULL, NULL, 100, 90, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('MID SHELF', 'Crescendo RBX1', 'hybrid', 23, NULL, NULL, NULL, 100, 90, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('PREMIUM', 'Permanent Marker S1', 'indica', 25, NULL, NULL, NULL, 295, 181, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('SMALLS', 'Supreme Oreoz', 'indica', NULL, NULL, NULL, NULL, 79, 79, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('SMALLS', 'Super Boof Cherry', 'sativa', NULL, NULL, NULL, NULL, 79, 79, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('SMALLS', 'White Runtz', 'hybrid', 18, NULL, NULL, NULL, 79, 79, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('CBG CBD', 'White Whale (CBG)', NULL, NULL, NULL, NULL, NULL, 196, 120, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('CBG CBD', 'Avto Tune (CBD)', NULL, NULL, NULL, NULL, NULL, 196, 120, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('PRE ROLLS', 'Hash Hole', NULL, NULL, NULL, 550, NULL, NULL, NULL, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('PRE ROLLS', 'Andaman 2 papirosas', NULL, NULL, NULL, 128, NULL, NULL, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('PRE ROLLS', 'Andaman 5 papirosas', NULL, NULL, NULL, 299, NULL, NULL, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('PRE ROLLS', 'Fresh Joints Indica/Sativa/Hybrid', NULL, NULL, NULL, 100, NULL, NULL, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('FRESH FROZEN HASH', 'Tropical Chery Gas (Full Melt)', NULL, NULL, NULL, NULL, 1200, 1020, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('FRESH FROZEN HASH', 'Permanent Marker S1 (Full Spectrum)', NULL, NULL, NULL, NULL, 800, 680, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('FRESH FROZEN HASH', 'Tutti Fruti (Full Spectrum)', NULL, NULL, NULL, NULL, 700, 595, NULL, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('FRESH FROZEN HASH', 'Big Detroit Energy (Full Spectrum)', NULL, NULL, NULL, NULL, 700, 595, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('FRESH FROZEN HASH', 'The Queen (Piatella)', NULL, NULL, NULL, NULL, 1600, 1360, NULL, FALSE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('LIVE HASH ROSIN', 'Tropical Chery Gas', NULL, NULL, NULL, NULL, 1800, 1530, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('LIVE HASH ROSIN', 'Permanent Marker S1', NULL, NULL, NULL, NULL, 1800, 1530, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('LIVE HASH ROSIN', 'Banana Hammock RBX1', NULL, NULL, NULL, NULL, 1900, 1615, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('LIVE HASH ROSIN', 'Big Detroit Energy', NULL, NULL, NULL, NULL, 1700, 1445, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('DRY SIFT HASH', 'Crescendo RBX1', NULL, NULL, NULL, NULL, 500, 425, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('DRY SIFT HASH', 'Banana Hammock RBX1', NULL, NULL, NULL, NULL, 600, 510, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('DRY SIFT HASH', 'LSD', NULL, NULL, NULL, NULL, 300, 255, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('ICE BUBBLE HASH', 'Mix 120u', NULL, NULL, NULL, NULL, 500, 425, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('ICE BUBBLE HASH', 'Mix 90u', NULL, NULL, NULL, NULL, 400, 340, NULL, TRUE, NOW(), NOW());

INSERT INTO menu_items (category, name, type, thc, cbg, price_1pc, price_1g, price_5g, price_20g, our, created_at, updated_at) VALUES ('ICE BUBBLE HASH', 'Mix Full Spectrum', NULL, NULL, NULL, NULL, 300, 255, NULL, TRUE, NOW(), NOW());

-- Обновляем layout меню (заменяем только layout, товары остаются)
DELETE FROM menu_layout;
INSERT INTO menu_layout (column1, column2, column3, created_at, updated_at) VALUES (
  ARRAY['TOP SHELF', 'MID SHELF', 'CBG CBD'],
  ARRAY['PREMIUM', 'SMALLS', 'PRE ROLLS'],
  ARRAY['FRESH FROZEN HASH', 'LIVE HASH ROSIN', 'DRY SIFT HASH', 'ICE BUBBLE HASH'],
  NOW(),
  NOW()
);

COMMIT;
