-- ============================================
-- ALI FARM V2 - SUPABASE DATABASE SCHEMA
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id VARCHAR(10) UNIQUE, -- Sequential AF-xxx ID
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'GUEST' CHECK (role IN ('OWNER', 'STAFF', 'INVESTOR', 'GUEST')),
    avatar_url TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.cages (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 0,
    occupied INTEGER NOT NULL DEFAULT 0,
    cctv_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- SHEEP TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.sheep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tag_id VARCHAR(20) UNIQUE NOT NULL,
    breed VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    gender VARCHAR(10) NOT NULL CHECK (gender IN ('Male', 'Female')),
    status VARCHAR(20) NOT NULL DEFAULT 'Healthy' CHECK (status IN ('Healthy', 'Sick', 'Sold', 'Deceased', 'Quarantine')),
    cage_id VARCHAR(20) REFERENCES public.cages(id),
    image_url TEXT,
    notes TEXT,
    purchase_price DECIMAL(15, 2),
    market_value DECIMAL(15, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- WEIGHT HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.weight_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sheep_id UUID NOT NULL REFERENCES public.sheep(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    weight DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INVESTMENT PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.investment_packages (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price_per_unit DECIMAL(15, 2) NOT NULL,
    duration_months INTEGER NOT NULL,
    estimated_roi DECIMAL(5, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('Single', 'Batch', 'Cage')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER INVESTMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    package_id VARCHAR(20) NOT NULL REFERENCES public.investment_packages(id),
    units INTEGER NOT NULL DEFAULT 1,
    purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Completed')),
    current_value DECIMAL(15, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QURBAN SAVINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.qurban_savings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    target_amount DECIMAL(15, 2) NOT NULL,
    current_amount DECIMAL(15, 2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    target_date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- QURBAN PACKAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.qurban_packages (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    weight_range VARCHAR(50) NOT NULL,
    price DECIMAL(15, 2) NOT NULL,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- MARKET PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.market_products (
    id VARCHAR(20) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Sheep', 'Feed', 'Medicine')),
    price DECIMAL(15, 2) NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- APP CONFIG TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.app_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    feature_investment BOOLEAN DEFAULT TRUE,
    feature_qurban BOOLEAN DEFAULT TRUE,
    feature_marketplace BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id VARCHAR(20) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(15, 2) NOT NULL,
    shipping_cost DECIMAL(15, 2) DEFAULT 0,
    service_fee DECIMAL(15, 2) DEFAULT 0,
    unique_code INTEGER DEFAULT 0,
    total DECIMAL(15, 2) NOT NULL,
    payment_method VARCHAR(20) NOT NULL,
    bank_account VARCHAR(20),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_sheep_cage ON public.sheep(cage_id);
CREATE INDEX IF NOT EXISTS idx_sheep_status ON public.sheep(status);
CREATE INDEX IF NOT EXISTS idx_weight_records_sheep ON public.weight_records(sheep_id);
CREATE INDEX IF NOT EXISTS idx_user_investments_user ON public.user_investments(user_id);
CREATE INDEX IF NOT EXISTS idx_qurban_savings_user ON public.qurban_savings(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to generate sequential user ID (AF-xxx)
CREATE OR REPLACE FUNCTION generate_user_id()
RETURNS TRIGGER AS $$
DECLARE
    next_num INTEGER;
BEGIN
    SELECT COALESCE(MAX(CAST(SUBSTRING(user_id FROM 4) AS INTEGER)), 0) + 1
    INTO next_num
    FROM public.profiles
    WHERE user_id IS NOT NULL;

    NEW.user_id := 'AF-' || LPAD(next_num::TEXT, 3, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for auto-generating user ID
DROP TRIGGER IF EXISTS trigger_generate_user_id ON public.profiles;
CREATE TRIGGER trigger_generate_user_id
    BEFORE INSERT ON public.profiles
    FOR EACH ROW
    WHEN (NEW.user_id IS NULL)
    EXECUTE FUNCTION generate_user_id();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_cages_updated_at ON public.cages;
CREATE TRIGGER update_cages_updated_at BEFORE UPDATE ON public.cages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_sheep_updated_at ON public.sheep;
CREATE TRIGGER update_sheep_updated_at BEFORE UPDATE ON public.sheep FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_investment_packages_updated_at ON public.investment_packages;
CREATE TRIGGER update_investment_packages_updated_at BEFORE UPDATE ON public.investment_packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_user_investments_updated_at ON public.user_investments;
CREATE TRIGGER update_user_investments_updated_at BEFORE UPDATE ON public.user_investments FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_qurban_savings_updated_at ON public.qurban_savings;
CREATE TRIGGER update_qurban_savings_updated_at BEFORE UPDATE ON public.qurban_savings FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_market_products_updated_at ON public.market_products;
CREATE TRIGGER update_market_products_updated_at BEFORE UPDATE ON public.market_products FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Function to auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'GUEST')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sheep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurban_savings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qurban_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES POLICIES
-- ============================================
CREATE POLICY "Profiles viewable by authenticated" ON public.profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Owner can insert profiles" ON public.profiles
    FOR INSERT TO authenticated
    WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER')
        OR NOT EXISTS (SELECT 1 FROM public.profiles)
    );

CREATE POLICY "Owner can delete profiles" ON public.profiles
    FOR DELETE TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- CAGES POLICIES
-- ============================================
CREATE POLICY "Cages viewable by authenticated" ON public.cages
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner/Staff can manage cages" ON public.cages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OWNER', 'STAFF')));

-- ============================================
-- SHEEP POLICIES
-- ============================================
CREATE POLICY "Sheep viewable by authenticated" ON public.sheep
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner/Staff can manage sheep" ON public.sheep
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OWNER', 'STAFF')));

-- ============================================
-- WEIGHT RECORDS POLICIES
-- ============================================
CREATE POLICY "Weight records viewable by authenticated" ON public.weight_records
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Owner/Staff can manage weight records" ON public.weight_records
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OWNER', 'STAFF')));

-- ============================================
-- INVESTMENT PACKAGES POLICIES
-- ============================================
CREATE POLICY "Packages publicly viewable" ON public.investment_packages
    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Owner can manage packages" ON public.investment_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- USER INVESTMENTS POLICIES
-- ============================================
CREATE POLICY "Users view own investments, Owner views all" ON public.user_investments
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER')
    );

CREATE POLICY "Users can create own investments" ON public.user_investments
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Owner can manage all investments" ON public.user_investments
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- QURBAN SAVINGS POLICIES
-- ============================================
CREATE POLICY "Users view own qurban savings" ON public.qurban_savings
    FOR SELECT TO authenticated
    USING (
        user_id = auth.uid() OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER')
    );

CREATE POLICY "Users can manage own qurban savings" ON public.qurban_savings
    FOR ALL TO authenticated
    USING (user_id = auth.uid());

-- ============================================
-- QURBAN PACKAGES POLICIES
-- ============================================
CREATE POLICY "Qurban packages publicly viewable" ON public.qurban_packages
    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Owner can manage qurban packages" ON public.qurban_packages
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- MARKET PRODUCTS POLICIES
-- ============================================
CREATE POLICY "Products publicly viewable" ON public.market_products
    FOR SELECT TO anon, authenticated USING (is_active = true);

CREATE POLICY "Owner can manage products" ON public.market_products
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- APP CONFIG POLICIES
-- ============================================
CREATE POLICY "Config publicly viewable" ON public.app_config
    FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Owner can manage config" ON public.app_config
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- ============================================
-- ORDERS POLICIES
-- ============================================
CREATE POLICY "Orders publicly insertable" ON public.orders
    FOR INSERT TO anon, authenticated WITH CHECK (true);

CREATE POLICY "Owner/Staff can view orders" ON public.orders
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OWNER', 'STAFF')));

CREATE POLICY "Owner/Staff can manage orders" ON public.orders
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('OWNER', 'STAFF')));
