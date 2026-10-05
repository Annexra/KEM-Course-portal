-- KEM Seed Data (Kauvery Emergency Medicine)

-- Roles
INSERT INTO roles (id, name, description) VALUES
('11111111-1111-1111-1111-111111111111', 'student', 'Kauvery EM Student/Resident'),
('22222222-2222-2222-2222-222222222222', 'faculty', 'Kauvery EM Faculty Member'),
('33333333-3333-3333-3333-333333333333', 'sub_admin', 'Department Sub-Admin'),
('44444444-4444-4444-4444-444444444444', 'super_admin', 'System Super Administrator')
ON CONFLICT (name) DO NOTHING;

-- Departments
INSERT INTO departments (id, name, code, description) VALUES
('d1111111-1111-1111-1111-111111111111', 'Emergency Medicine & Trauma Care', 'EM-KAUVERY', 'Core emergency medicine, triage, and critical care residency program')
ON CONFLICT (code) DO NOTHING;

-- Profiles
INSERT INTO profiles (id, email, full_name, avatar_url, status, department_id) VALUES
('11111111-aaaa-4aaa-8aaa-111111111111', 'dr.sarah.admin@kauvery.org', 'Dr. Sarah Lin (Super Admin)', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150', 'approved', 'd1111111-1111-1111-1111-111111111111'),
('22222222-aaaa-4aaa-8aaa-222222222222', 'dr.rajesh.faculty@kauvery.org', 'Dr. Rajesh V. (EM Lead Faculty)', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150', 'approved', 'd1111111-1111-1111-1111-111111111111'),
('33333333-aaaa-4aaa-8aaa-333333333333', 'em.resident1@kauvery.org', 'Dr. Arjun Mehta (EM Resident)', 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150', 'approved', 'd1111111-1111-1111-1111-111111111111'),
('44444444-aaaa-4aaa-8aaa-444444444444', 'em.resident2@kauvery.org', 'Dr. Priya Sharma (EM Resident)', 'https://images.unsplash.com/photo-1594824813566-88855ce78905?w=150', 'pending', 'd1111111-1111-1111-1111-111111111111')
ON CONFLICT (email) DO NOTHING;

-- User Roles
INSERT INTO user_roles (user_id, role_id) VALUES
('11111111-aaaa-4aaa-8aaa-111111111111', '44444444-4444-4444-4444-444444444444'),
('22222222-aaaa-4aaa-8aaa-222222222222', '22222222-2222-2222-2222-222222222222'),
('33333333-aaaa-4aaa-8aaa-333333333333', '11111111-1111-1111-1111-111111111111'),
('44444444-aaaa-4aaa-8aaa-444444444444', '11111111-1111-1111-1111-111111111111')
ON CONFLICT DO NOTHING;

-- Courses
INSERT INTO courses (id, department_id, title, code, description, thumbnail_url, status, created_by) VALUES
('c1111111-1111-4111-8111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'Advanced Cardiac Life Support (ACLS 2026)', 'EM-ACLS-101', 'Comprehensive emergency resuscitation protocol for lethal arrhythmias, cardiac arrest, and post-cardiac care.', 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600', 'published', '22222222-aaaa-4aaa-8aaa-222222222222'),
('c2222222-2222-4222-8222-222222222222', 'd1111111-1111-1111-1111-111111111111', 'Emergency Airway Management & RSI', 'EM-AIRWAY-202', 'Rapid Sequence Intubation (RSI) procedures, difficult airway algorithms, and emergency cricothyroidotomy.', 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600', 'published', '22222222-aaaa-4aaa-8aaa-222222222222')
ON CONFLICT (code) DO NOTHING;

-- Certificate Rules
INSERT INTO certificate_rules (course_id, min_video_completion_pct, min_assessment_pass_pct) VALUES
('c1111111-1111-4111-8111-111111111111', 90.0, 75.0),
('c2222222-2222-4222-8222-222222222222', 90.0, 80.0)
ON CONFLICT (course_id) DO NOTHING;