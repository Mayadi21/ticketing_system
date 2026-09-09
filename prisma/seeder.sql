-- =====================================================
-- EXTENSION
-- =====================================================
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================
-- BRANCH SEEDER
-- =====================================================
INSERT INTO public.branch
(branch_name, address, city_prov, phone, zip_code, branch_code)
VALUES
('KC Koordinator Medan', 'Jl. Imam Bonjol No.18', 'Medan, Sumatera Utara', '061-4515100', '20212', 'KMD'),
('KC Koordinator Pematang Siantar', 'Jl. Merdeka No.10', 'Pematang Siantar, Sumatera Utara', '0622-21446', '21111', 'KPS'),
('KC Koordinator Padang Sidempuan', 'Jl. Merdeka/Ex Sudirman No.1-A', 'Padang Sidempuan, Sumatera Utara', '0634-23011', '22700', 'KPD'),
('KC Rantau Prapat', 'Jl. Jend. Gatot Subroto No.1-A', 'Labuhan Batu, Sumatera Utara', '0624-21242', '21411', 'RTP'),
('KC Balige', 'Jl. Sisingamangaraja No.42', 'Toba Samosir, Sumatera Utara', '0632-21092', '22312', 'BLG'),
('KC Kabanjahe', 'Jl. Kapten Pala Bangun No.3', 'Karo, Sumatera Utara', '0628-20448', '22111', 'KBJ'),
('KC Kisaran', 'Jl. Cokroaminoto No.25 Kisaran', 'Asahan, Sumatera Utara', '0623-41426', '21211', 'KSR'),
('KC Gunung Sitoli', 'Jl. Moh. Hatta No.1-A', 'Gunung Sitoli, Sumatera Utara', '0639-21454', '22810', 'GST'),
('KC Sidikalang', 'Jl. Sisingamangaraja No.172', 'Dairi, Sumatera Utara', '0627-21125', '22211', 'SDK'),
('KC Sibolga', 'Jl. K.H. Zainul Arifin No.15', 'Kota Sibolga, Sumatera Utara', '0631-21092', '22511', 'SBG');

-- =====================================================
-- USER SEEDER (Termasuk SUPERADMIN)
-- =====================================================
INSERT INTO public."user"
(
    branch_id,
    name,
    email,
    password,
    role,
    phone
)
VALUES
(
    NULL,
    'Super Administrator',
    'superadmin@gmail.com',
    crypt('password', gen_salt('bf')),
    'SUPERADMIN',
    '080000000000'
),
(
    NULL,
    'Administrator',
    'mayadisilalahi@gmail.com',
    crypt('password', gen_salt('bf')),
    'ADMIN',
    '081111111111'
),
(
    NULL,
    'Putra Eng',
    'putraalamsyah2108@gmail.com',
    crypt('password', gen_salt('bf')),
    'ENGINEER',
    '081222222222'
),
(
    NULL,
    'Andi Eng',
    'putraalamsyah2108+1@gmail.com',
    crypt('password', gen_salt('bf')),
    'ENGINEER',
    '081333333333'
),
(
    2,
    'Jesica Brc',
    'mayadisilalahi@students.usu.ac.id',
    crypt('password', gen_salt('bf')),
    'BRANCH',
    '062221446'
),
(
    3,
    'Mike Brc',
    'mayadisilalahi+1@students.usu.ac.id',
    crypt('password', gen_salt('bf')),
    'BRANCH',
    '063423011'
),
(
    4,
    'Josh Brc',
    'mayadisilalahi+2@students.usu.ac.id',
    crypt('password', gen_salt('bf')),
    'BRANCH',
    '062421242'
);