-- ============================================================
--  ORGANOVA – SEED DATA (development only)
-- ============================================================
USE organova_db;

-- Admin user  (password: Admin@1234)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Organova', 'admin@organova.com',
 '$2a$12$Usf7NLdYuUpB9lT6GtqJ7uuhMWmfCZqovwBwgYy5ayNcwII7Zk.9i', 'admin')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Regular user  (password: Jane@1234)
INSERT INTO users (name, email, password_hash, role) VALUES
('Jane Doe', 'jane@example.com',
 '$2a$12$IW.EvMxhSL9f3HXz550.Ue5XrwD4jgXM0HONFFoDy0nHPUxaK7E2q', 'user')
ON DUPLICATE KEY UPDATE password_hash = VALUES(password_hash);

-- Categories for user 2
INSERT IGNORE INTO categories (user_id, name, color, icon) VALUES
(2, 'Work',     '#6C63FF', 'briefcase'),
(2, 'Personal', '#FF6584', 'heart'),
(2, 'Learning', '#43C6AC', 'book');

-- Sample tasks
INSERT IGNORE INTO tasks (user_id, category_id, title, description, status, priority, due_date) VALUES
(2, 1, 'Setup project repo',   'Initialize Git and CI/CD',  'done',        'high',   '2026-02-01'),
(2, 1, 'Design API endpoints', 'REST API for Organova',      'in_progress', 'high',   '2026-02-20'),
(2, 3, 'Read Clean Code book', 'Chapters 1-5',               'todo',        'medium', '2026-03-01');
