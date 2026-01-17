-- ============================================
-- ALI FARM V2 - SEED DATA
-- Run this AFTER schema.sql
-- ============================================

-- Insert default app config
INSERT INTO public.app_config (id, feature_investment, feature_qurban, feature_marketplace)
VALUES (1, true, true, true)
ON CONFLICT (id) DO NOTHING;

-- Insert cages
INSERT INTO public.cages (id, name, capacity, occupied, cctv_url) VALUES
('CAGE-A', 'Alpha Block', 20, 15, 'https://example.com/cctv/alpha'),
('CAGE-B', 'Beta Block (Quarantine)', 5, 1, 'https://example.com/cctv/beta'),
('CAGE-C', 'Charlie Block', 30, 28, 'https://example.com/cctv/charlie')
ON CONFLICT (id) DO NOTHING;

-- Insert investment packages
INSERT INTO public.investment_packages (id, name, description, price_per_unit, duration_months, estimated_roi, type, is_active) VALUES
('PKG-1', 'Paket Breeding Exclusive', 'Investasi 1 ekor domba breeding berkualitas tinggi dengan perawatan premium. Cocok untuk investor pemula.', 4500000, 36, 45, 'Single', true),
('PKG-2', 'Paket Batch 5 Ekor', 'Investasi batch 5 ekor domba dengan harga lebih ekonomis. ROI lebih tinggi.', 20000000, 24, 55, 'Batch', true),
('PKG-3', 'Paket Full Cage', 'Investasi penuh 1 kandang (20 ekor). ROI maksimal untuk investor serius.', 80000000, 36, 65, 'Cage', true)
ON CONFLICT (id) DO NOTHING;

-- Insert qurban packages
INSERT INTO public.qurban_packages (id, name, weight_range, price, description, image_url, is_active) VALUES
('QURBAN-S', 'Domba Standar', '20-25 kg', 2300000, 'Domba sehat dengan berat standar untuk qurban.', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', true),
('QURBAN-M', 'Domba Medium', '25-30 kg', 2900000, 'Domba pilihan dengan berat medium, gemuk dan sehat.', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', true),
('QURBAN-L', 'Domba Super', '30-35 kg', 3500000, 'Domba super premium, berat di atas rata-rata.', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Insert market products
INSERT INTO public.market_products (id, name, category, price, stock, description, image_url, is_active) VALUES
('PROD-1', 'Premium Alfalfa Hay', 'Feed', 150000, 50, 'Pakan alfalfa berkualitas tinggi, kaya nutrisi untuk pertumbuhan optimal.', 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?w=400', true),
('PROD-2', 'Mineral Block Lick', 'Feed', 45000, 100, 'Blok mineral untuk melengkapi kebutuhan nutrisi domba.', 'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=400', true),
('PROD-3', 'Merino Ram (Breeder)', 'Sheep', 4500000, 2, 'Domba Merino jantan berkualitas untuk breeding.', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', true),
('PROD-4', 'Deworming Medicine', 'Medicine', 85000, 30, 'Obat cacing untuk domba, dosis untuk 10 ekor.', 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=400', true),
('PROD-5', 'Vitamin Supplement', 'Medicine', 120000, 25, 'Suplemen vitamin lengkap untuk menjaga kesehatan domba.', 'https://images.unsplash.com/photo-1550572017-edd951b55104?w=400', true)
ON CONFLICT (id) DO NOTHING;

-- Note: Sheep data will be inserted after cages exist
-- This requires the cages to be created first

-- Insert sample sheep (assuming cages exist)
INSERT INTO public.sheep (tag_id, breed, dob, gender, status, cage_id, image_url, purchase_price, market_value, notes) VALUES
('AF-001', 'Merino', '2023-01-15', 'Male', 'Healthy', 'CAGE-A', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', 2500000, 4500000, 'Domba unggul, pertumbuhan sangat baik'),
('AF-002', 'Dorper', '2023-03-20', 'Female', 'Healthy', 'CAGE-A', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', 2000000, 3200000, 'Betina produktif'),
('AF-003', 'Garut', '2023-02-10', 'Male', 'Sick', 'CAGE-B', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', 3000000, 2100000, 'Sedang dalam perawatan'),
('AF-004', 'Suffolk', '2022-12-05', 'Female', 'Healthy', 'CAGE-C', 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?w=400', 2800000, 5000000, 'Domba premium, siap breeding')
ON CONFLICT (tag_id) DO NOTHING;

-- Insert weight records for sheep (need to get sheep IDs first)
-- This will be done via application or separate script after sheep are inserted

DO $$
DECLARE
    sheep_id_1 UUID;
    sheep_id_2 UUID;
    sheep_id_3 UUID;
    sheep_id_4 UUID;
BEGIN
    SELECT id INTO sheep_id_1 FROM public.sheep WHERE tag_id = 'AF-001';
    SELECT id INTO sheep_id_2 FROM public.sheep WHERE tag_id = 'AF-002';
    SELECT id INTO sheep_id_3 FROM public.sheep WHERE tag_id = 'AF-003';
    SELECT id INTO sheep_id_4 FROM public.sheep WHERE tag_id = 'AF-004';

    IF sheep_id_1 IS NOT NULL THEN
        INSERT INTO public.weight_records (sheep_id, date, weight) VALUES
        (sheep_id_1, '2023-02-01', 15),
        (sheep_id_1, '2023-03-01', 22),
        (sheep_id_1, '2023-04-01', 30),
        (sheep_id_1, '2023-05-01', 38),
        (sheep_id_1, '2023-06-01', 45)
        ON CONFLICT DO NOTHING;
    END IF;

    IF sheep_id_2 IS NOT NULL THEN
        INSERT INTO public.weight_records (sheep_id, date, weight) VALUES
        (sheep_id_2, '2023-04-01', 12),
        (sheep_id_2, '2023-05-01', 18),
        (sheep_id_2, '2023-06-01', 25),
        (sheep_id_2, '2023-07-01', 32)
        ON CONFLICT DO NOTHING;
    END IF;

    IF sheep_id_3 IS NOT NULL THEN
        INSERT INTO public.weight_records (sheep_id, date, weight) VALUES
        (sheep_id_3, '2023-03-01', 14),
        (sheep_id_3, '2023-04-01', 17),
        (sheep_id_3, '2023-05-01', 19),
        (sheep_id_3, '2023-06-01', 21)
        ON CONFLICT DO NOTHING;
    END IF;

    IF sheep_id_4 IS NOT NULL THEN
        INSERT INTO public.weight_records (sheep_id, date, weight) VALUES
        (sheep_id_4, '2023-01-01', 20),
        (sheep_id_4, '2023-02-01', 28),
        (sheep_id_4, '2023-03-01', 36),
        (sheep_id_4, '2023-04-01', 44),
        (sheep_id_4, '2023-05-01', 50)
        ON CONFLICT DO NOTHING;
    END IF;
END $$;
