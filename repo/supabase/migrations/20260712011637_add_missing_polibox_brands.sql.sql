/*
# Add missing Polibox brands

1. New Data
- Creates 7 new brand records that were found on polibox.com.br but not yet in the database:
  - Dub Boyz (shampoos, aromatizantes)
  - Zacs (shampoos, ceras, limpadores)
  - Magil Clean (shampoos, limpadores)
  - Finisher (ceras)
  - Spartan (aromatizantes)
  - Wurth (vidros)
  - Resoltak (vidros/polimento)
2. Security
- No schema changes. Only INSERT statements into existing brands table.
*/

INSERT INTO brands (name, slug) VALUES
  ('Dub Boyz', 'dub-boyz'),
  ('Zacs', 'zacs'),
  ('Magil Clean', 'magil-clean'),
  ('Finisher', 'finisher'),
  ('Spartan', 'spartan'),
  ('Wurth', 'wurth'),
  ('Resoltak', 'resoltak')
ON CONFLICT (slug) DO NOTHING;
