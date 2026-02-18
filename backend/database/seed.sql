-- ============================================================
--  ORGANOVA – SEED DATA (development only)
-- ============================================================
USE organova_db;

-- Admin user  (password: Admin@1234  →  bcrypt hash)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin Organova', 'admin@organova.com',
 '$2b$12$KIXkQ2Q2Q2Q2Q2Q2Q2Q2QeQ2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2', 'admin');

-- Regular user
INSERT INTO users (name, email, password_hash, role) VALUES
('Jane Doe', 'jane@example.com',
 '$2b$12$KIXkQ2Q2Q2Q2Q2Q2Q2Q2QeQ2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2Q2', 'user');

-- Categories for user 2
INSERT INTO categories (user_id, name, color, icon) VALUES
(2, 'Work',     '#6C63FF', 'briefcase'),
(2, 'Personal', '#FF6584', 'heart'),
(2, 'Learning', '#43C6AC', 'book');

-- Sample tasks
INSERT INTO tasks (user_id, category_id, title, description, status, priority, due_date) VALUES
(2, 1, 'Setup project repo',   'Initialize Git and CI/CD',  'done',        'high',   '2026-02-01'),
(2, 1, 'Design API endpoints', 'REST API for Organova',      'in_progress', 'high',   '2026-02-20'),
(2, 3, 'Read Clean Code book', 'Chapters 1-5',               'todo',        'medium', '2026-03-01');
