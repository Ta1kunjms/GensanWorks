-- Shared skill/specialization suggestions (cross-device)

CREATE TABLE IF NOT EXISTS skill_suggestions (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  created_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at INTEGER DEFAULT CURRENT_TIMESTAMP NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS skill_suggestions_normalized_unique
  ON skill_suggestions(normalized_name);

-- Seed common “Other Skills” options
INSERT OR IGNORE INTO skill_suggestions (id, name, normalized_name)
VALUES
  ('seed_auto_mechanic', 'Auto Mechanic', 'auto mechanic'),
  ('seed_beautician', 'Beautician', 'beautician'),
  ('seed_carpentry_work', 'Carpentry Work', 'carpentry work'),
  ('seed_computer_literate', 'Computer Literate', 'computer literate'),
  ('seed_domestic_chores', 'Domestic Chores', 'domestic chores'),
  ('seed_driver', 'Driver', 'driver'),
  ('seed_electrician', 'Electrician', 'electrician'),
  ('seed_embroidery', 'Embroidery', 'embroidery'),
  ('seed_gardening', 'Gardening', 'gardening'),
  ('seed_masonry', 'Masonry', 'masonry'),
  ('seed_painter_artist', 'Painter/Artist', 'painter/artist'),
  ('seed_painting_jobs', 'Painting Jobs', 'painting jobs'),
  ('seed_photography', 'Photography', 'photography'),
  ('seed_plumbing', 'Plumbing', 'plumbing'),
  ('seed_sewing_dresses', 'Sewing Dresses', 'sewing dresses'),
  ('seed_stenography', 'Stenography', 'stenography'),
  ('seed_tailoring', 'Tailoring', 'tailoring');
