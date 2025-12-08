-- Sample Data for Game Accounts Database
-- Run this file after running database.sql to insert sample data

USE game_accounts_db;

-- Insert default admin user (password: admin123)
INSERT INTO users (username, email, password, role) VALUES 
('admin', 'admin@example.com', '$2b$10$H8DfTZaP/3yTqLPZT6z1RO8UqR/eYW2dQHY2bW0qi0GY0ZqUzwhPS', 'admin');

-- Insert sample products
INSERT INTO products (game_name, account_level, price, description, account_info) VALUES
-- Liên Quân Mobile
('Liên Quân Mobile', 'Kim Cương I', 450000, 'Nick Liên Quân rank Kim Cương I, có 50+ tướng, nhiều skin hiếm, full trang bị', 'Username: aov_diamond1, Password: aov2024'),
('Liên Quân Mobile', 'Cao Thủ', 650000, 'Nick Liên Quân rank Cao Thủ, 80+ tướng, skin legend, full trang bị cấp 3', 'Username: aov_master, Password: master123'),
('Liên Quân Mobile', 'Thách Đấu', 850000, 'Nick Liên Quân rank Thách Đấu, 100+ tướng, đầy đủ skin, full trang bị max', 'Username: aov_challenger, Password: challenger2024'),
('Liên Quân Mobile', 'Bạch Kim', 350000, 'Nick Liên Quân rank Bạch Kim, 40+ tướng, skin đẹp, trang bị tốt', 'Username: aov_platinum, Password: platinum123'),

-- PUBG Mobile
('PUBG Mobile', 'Crown I', 320000, 'Nick PUBG rank Crown I, nhiều skin quý hiếm, full đồ cấp 3, có xe đẹp', 'Username: pubg_crown1, Password: pubg2024'),
('PUBG Mobile', 'Ace', 480000, 'Nick PUBG rank Ace, full skin, có nhiều outfit hiếm, full đồ max', 'Username: pubg_ace, Password: ace123'),
('PUBG Mobile', 'Conqueror', 750000, 'Nick PUBG rank Conqueror, top server, full skin legend, có nhiều xe hiếm', 'Username: pubg_conqueror, Password: conqueror2024'),
('PUBG Mobile', 'Diamond', 250000, 'Nick PUBG rank Diamond, nhiều skin đẹp, full đồ cấp 2-3', 'Username: pubg_diamond, Password: diamond123'),

-- Free Fire
('Free Fire', 'Huyền Thoại', 220000, 'Nick Free Fire rank Huyền Thoại, nhiều nhân vật, skin đẹp, full vũ khí', 'Username: ff_legend, Password: ff2024'),
('Free Fire', 'Cao Thủ', 380000, 'Nick Free Fire rank Cao Thủ, đầy đủ nhân vật, skin hiếm, full vũ khí max', 'Username: ff_master, Password: master123'),
('Free Fire', 'Bạch Kim', 150000, 'Nick Free Fire rank Bạch Kim, 20+ nhân vật, skin đẹp, vũ khí tốt', 'Username: ff_platinum, Password: platinum123'),
('Free Fire', 'Vàng', 100000, 'Nick Free Fire rank Vàng, 15+ nhân vật, skin cơ bản, vũ khí ổn', 'Username: ff_gold, Password: gold123'),

-- Mobile Legends
('Mobile Legends', 'Mythic', 420000, 'Nick ML rank Mythic, 60+ tướng, nhiều skin hiếm, full emblem max', 'Username: ml_mythic, Password: ml2024'),
('Mobile Legends', 'Mythic Glory', 680000, 'Nick ML rank Mythic Glory, 80+ tướng, đầy đủ skin, emblem max, có skin collector', 'Username: ml_glory, Password: glory123'),
('Mobile Legends', 'Epic', 280000, 'Nick ML rank Epic, 40+ tướng, skin đẹp, emblem tốt', 'Username: ml_epic, Password: epic123'),
('Mobile Legends', 'Legend', 350000, 'Nick ML rank Legend, 50+ tướng, nhiều skin, emblem khá', 'Username: ml_legend, Password: legend123'),

-- Genshin Impact
('Genshin Impact', 'AR 55', 1200000, 'Nick Genshin Impact AR 55, nhiều nhân vật 5 sao, vũ khí 5 sao, full map', 'Username: genshin_ar55, Password: genshin2024'),
('Genshin Impact', 'AR 50', 850000, 'Nick Genshin Impact AR 50, 15+ nhân vật 5 sao, vũ khí tốt, map gần full', 'Username: genshin_ar50, Password: ar50123'),
('Genshin Impact', 'AR 45', 550000, 'Nick Genshin Impact AR 45, 10+ nhân vật 5 sao, vũ khí 4-5 sao', 'Username: genshin_ar45, Password: ar45123'),

-- Valorant
('Valorant', 'Immortal', 950000, 'Nick Valorant rank Immortal, nhiều skin premium, full agent, có skin Vandal/Phantom hiếm', 'Username: valorant_immortal, Password: val2024'),
('Valorant', 'Diamond', 650000, 'Nick Valorant rank Diamond, nhiều skin đẹp, full agent, skin tốt', 'Username: valorant_diamond, Password: diamond123'),
('Valorant', 'Platinum', 450000, 'Nick Valorant rank Platinum, skin khá, đủ agent, vũ khí ổn', 'Username: valorant_plat, Password: plat123');

