-- ============================================
-- ALI FARM V2 - INVESTOR MANAGEMENT SCHEMA
-- Run this AFTER the main schema.sql
-- ============================================

-- ============================================
-- MODIFY SHEEP TABLE - Add parent references for hierarchy
-- ============================================
ALTER TABLE public.sheep
ADD COLUMN IF NOT EXISTS parent_male_id UUID REFERENCES public.sheep(id),
ADD COLUMN IF NOT EXISTS parent_female_id UUID REFERENCES public.sheep(id),
ADD COLUMN IF NOT EXISTS birth_type VARCHAR(20) DEFAULT 'Purchased' CHECK (birth_type IN ('Purchased', 'Born'));

-- ============================================
-- INVESTOR CONTRACTS TABLE
-- Kontrak investasi antara owner dan investor
-- ============================================
CREATE TABLE IF NOT EXISTS public.investor_contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_number VARCHAR(20) UNIQUE NOT NULL, -- INV-2024-001
    investor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

    -- Financial details
    investment_amount DECIMAL(15, 2) NOT NULL, -- Jumlah investasi (Rp)
    profit_sharing_percentage DECIMAL(5, 2) NOT NULL DEFAULT 70, -- % bagi hasil untuk investor

    -- Duration
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    duration_months INTEGER NOT NULL DEFAULT 12,
    end_date DATE GENERATED ALWAYS AS (start_date + (duration_months || ' months')::INTERVAL) STORED,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Draft', 'Active', 'Completed', 'Cancelled')),

    -- Final settlement (filled when completed)
    total_revenue DECIMAL(15, 2), -- Total pendapatan dari penjualan
    total_expenses DECIMAL(15, 2), -- Total pengeluaran
    net_profit DECIMAL(15, 2), -- Laba bersih
    investor_profit DECIMAL(15, 2), -- Bagian investor
    actual_roi DECIMAL(5, 2), -- ROI aktual (%)
    settlement_date DATE,
    settlement_notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CONTRACT SHEEP ALLOCATION TABLE
-- Alokasi domba ke kontrak investor
-- ============================================
CREATE TABLE IF NOT EXISTS public.contract_sheep (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES public.investor_contracts(id) ON DELETE CASCADE,
    sheep_id UUID NOT NULL REFERENCES public.sheep(id) ON DELETE CASCADE,

    -- Allocation details
    allocation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    purchase_price DECIMAL(15, 2) NOT NULL, -- Harga beli saat alokasi

    -- Sale details (filled when sold)
    sale_date DATE,
    sale_price DECIMAL(15, 2),

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold', 'Deceased', 'Transferred')),
    notes TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(contract_id, sheep_id)
);

-- ============================================
-- CONTRACT EXPENSES TABLE
-- Pengeluaran per kontrak investasi
-- ============================================
CREATE TABLE IF NOT EXISTS public.contract_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES public.investor_contracts(id) ON DELETE CASCADE,

    expense_date DATE NOT NULL DEFAULT CURRENT_DATE,
    category VARCHAR(50) NOT NULL CHECK (category IN ('Feed', 'Medicine', 'Vaccination', 'Labor', 'Transport', 'Maintenance', 'Other')),
    description TEXT NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,

    -- Optional: link to specific sheep
    sheep_id UUID REFERENCES public.sheep(id),

    -- Receipt/proof
    receipt_url TEXT,

    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- FINANCIAL REPORTS TABLE
-- Laporan keuangan periodik untuk investor
-- ============================================
CREATE TABLE IF NOT EXISTS public.financial_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id UUID NOT NULL REFERENCES public.investor_contracts(id) ON DELETE CASCADE,

    report_period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    report_date DATE NOT NULL DEFAULT CURRENT_DATE,

    -- Summary
    opening_value DECIMAL(15, 2) NOT NULL, -- Nilai awal periode
    closing_value DECIMAL(15, 2) NOT NULL, -- Nilai akhir periode
    total_expenses DECIMAL(15, 2) NOT NULL DEFAULT 0,
    total_revenue DECIMAL(15, 2) NOT NULL DEFAULT 0,

    -- Sheep summary
    sheep_count INTEGER NOT NULL DEFAULT 0,
    sheep_born INTEGER NOT NULL DEFAULT 0,
    sheep_sold INTEGER NOT NULL DEFAULT 0,
    sheep_deceased INTEGER NOT NULL DEFAULT 0,

    -- Notes
    highlights TEXT, -- Perkembangan penting
    notes TEXT,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published')),
    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    UNIQUE(contract_id, report_period)
);

-- ============================================
-- INDEXES
-- ============================================
CREATE INDEX IF NOT EXISTS idx_investor_contracts_investor ON public.investor_contracts(investor_id);
CREATE INDEX IF NOT EXISTS idx_investor_contracts_status ON public.investor_contracts(status);
CREATE INDEX IF NOT EXISTS idx_contract_sheep_contract ON public.contract_sheep(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_sheep_sheep ON public.contract_sheep(sheep_id);
CREATE INDEX IF NOT EXISTS idx_contract_expenses_contract ON public.contract_expenses(contract_id);
CREATE INDEX IF NOT EXISTS idx_contract_expenses_date ON public.contract_expenses(expense_date);
CREATE INDEX IF NOT EXISTS idx_financial_reports_contract ON public.financial_reports(contract_id);
CREATE INDEX IF NOT EXISTS idx_sheep_parent_male ON public.sheep(parent_male_id);
CREATE INDEX IF NOT EXISTS idx_sheep_parent_female ON public.sheep(parent_female_id);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.investor_contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_sheep ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contract_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INVESTOR CONTRACTS POLICIES
-- ============================================
-- Owner can do everything
CREATE POLICY "Owner full access contracts" ON public.investor_contracts
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- Investor can view their own contracts
CREATE POLICY "Investor view own contracts" ON public.investor_contracts
    FOR SELECT TO authenticated
    USING (investor_id = auth.uid());

-- ============================================
-- CONTRACT SHEEP POLICIES
-- ============================================
-- Owner can do everything
CREATE POLICY "Owner full access contract_sheep" ON public.contract_sheep
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- Investor can view sheep in their contracts
CREATE POLICY "Investor view own contract sheep" ON public.contract_sheep
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_contracts
            WHERE id = contract_sheep.contract_id
            AND investor_id = auth.uid()
        )
    );

-- ============================================
-- CONTRACT EXPENSES POLICIES
-- ============================================
-- Owner can do everything
CREATE POLICY "Owner full access expenses" ON public.contract_expenses
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- Investor can view expenses in their contracts
CREATE POLICY "Investor view own contract expenses" ON public.contract_expenses
    FOR SELECT TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.investor_contracts
            WHERE id = contract_expenses.contract_id
            AND investor_id = auth.uid()
        )
    );

-- ============================================
-- FINANCIAL REPORTS POLICIES
-- ============================================
-- Owner can do everything
CREATE POLICY "Owner full access reports" ON public.financial_reports
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'OWNER'));

-- Investor can view published reports in their contracts
CREATE POLICY "Investor view own published reports" ON public.financial_reports
    FOR SELECT TO authenticated
    USING (
        status = 'Published' AND
        EXISTS (
            SELECT 1 FROM public.investor_contracts
            WHERE id = financial_reports.contract_id
            AND investor_id = auth.uid()
        )
    );

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to generate contract number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS VARCHAR(20) AS $$
DECLARE
    year_part VARCHAR(4);
    seq_num INTEGER;
    new_number VARCHAR(20);
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');

    SELECT COALESCE(MAX(
        CAST(SUBSTRING(contract_number FROM 10 FOR 3) AS INTEGER)
    ), 0) + 1
    INTO seq_num
    FROM public.investor_contracts
    WHERE contract_number LIKE 'INV-' || year_part || '-%';

    new_number := 'INV-' || year_part || '-' || LPAD(seq_num::TEXT, 3, '0');
    RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate contract summary
CREATE OR REPLACE FUNCTION calculate_contract_summary(p_contract_id UUID)
RETURNS TABLE (
    total_sheep INTEGER,
    total_purchase_value DECIMAL,
    total_current_value DECIMAL,
    total_expenses DECIMAL,
    total_revenue DECIMAL,
    sheep_born INTEGER,
    sheep_sold INTEGER,
    sheep_deceased INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM contract_sheep WHERE contract_id = p_contract_id AND status = 'Active'),
        (SELECT COALESCE(SUM(purchase_price), 0) FROM contract_sheep WHERE contract_id = p_contract_id),
        (SELECT COALESCE(SUM(s.market_value), 0) FROM contract_sheep cs JOIN sheep s ON cs.sheep_id = s.id WHERE cs.contract_id = p_contract_id AND cs.status = 'Active'),
        (SELECT COALESCE(SUM(amount), 0) FROM contract_expenses WHERE contract_id = p_contract_id),
        (SELECT COALESCE(SUM(sale_price), 0) FROM contract_sheep WHERE contract_id = p_contract_id AND status = 'Sold'),
        (SELECT COUNT(*)::INTEGER FROM contract_sheep cs JOIN sheep s ON cs.sheep_id = s.id WHERE cs.contract_id = p_contract_id AND s.birth_type = 'Born'),
        (SELECT COUNT(*)::INTEGER FROM contract_sheep WHERE contract_id = p_contract_id AND status = 'Sold'),
        (SELECT COUNT(*)::INTEGER FROM contract_sheep WHERE contract_id = p_contract_id AND status = 'Deceased');
END;
$$ LANGUAGE plpgsql;

-- Trigger to update contract updated_at
CREATE OR REPLACE FUNCTION update_contract_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_contract_timestamp
    BEFORE UPDATE ON public.investor_contracts
    FOR EACH ROW EXECUTE FUNCTION update_contract_timestamp();

CREATE TRIGGER trigger_update_contract_sheep_timestamp
    BEFORE UPDATE ON public.contract_sheep
    FOR EACH ROW EXECUTE FUNCTION update_contract_timestamp();

CREATE TRIGGER trigger_update_financial_report_timestamp
    BEFORE UPDATE ON public.financial_reports
    FOR EACH ROW EXECUTE FUNCTION update_contract_timestamp();
