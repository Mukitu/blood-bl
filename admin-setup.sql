-- Admin Settings Table
CREATE TABLE IF NOT EXISTS public.admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blocked Phones Table
CREATE TABLE IF NOT EXISTS public.blocked_phones (
    phone TEXT PRIMARY KEY,
    reason TEXT,
    blocked_at TIMESTAMPTZ DEFAULT now()
);

-- Blood Requests Table (Ensure it exists and has correct structure)
CREATE TABLE IF NOT EXISTS public.blood_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    requester_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    donor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    patient_name TEXT NOT NULL,
    disease_name TEXT,
    patient_phone TEXT NOT NULL,
    hospital_name TEXT NOT NULL,
    blood_group TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, accepted, declined
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Ratings Table
CREATE TABLE IF NOT EXISTS public.ratings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rater_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    request_id UUID REFERENCES public.blood_requests(id) ON DELETE SET NULL,
    stars INTEGER CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger to update user ratings
CREATE OR REPLACE FUNCTION public.update_user_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET 
        avg_rating = (SELECT AVG(stars) FROM public.ratings WHERE receiver_id = NEW.receiver_id),
        total_ratings = (SELECT COUNT(*) FROM public.ratings WHERE receiver_id = NEW.receiver_id)
    WHERE id = NEW.receiver_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_rating_insert ON public.ratings;
CREATE TRIGGER on_rating_insert
AFTER INSERT ON public.ratings
FOR EACH ROW EXECUTE FUNCTION public.update_user_rating();

-- RPC: Get Admin Stats
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'total_users', (SELECT count(*) FROM public.users),
        'total_donors', (SELECT count(*) FROM public.users WHERE is_donor = true),
        'total_doctors', (SELECT count(*) FROM public.users WHERE is_doctor = true),
        'total_ambulances', (SELECT count(*) FROM public.users WHERE is_ambulance = true),
        'today_requests', (SELECT count(*) FROM public.blood_requests WHERE created_at >= now()::date),
        'accepted_requests', (SELECT count(*) FROM public.blood_requests WHERE status = 'accepted')
    ) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin Block User
CREATE OR REPLACE FUNCTION public.admin_block_user(target_user_id UUID, block_reason_text TEXT)
RETURNS VOID AS $$
DECLARE
    user_phone TEXT;
BEGIN
    -- Get user phone
    SELECT phone INTO user_phone FROM public.users WHERE id = target_user_id;
    
    -- Update user status
    UPDATE public.users 
    SET is_blocked = true, block_reason = block_reason_text, is_active = false
    WHERE id = target_user_id;
    
    -- Add to blocked_phones
    INSERT INTO public.blocked_phones (phone, reason)
    VALUES (user_phone, block_reason_text)
    ON CONFLICT (phone) DO UPDATE SET reason = block_reason_text;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin Unblock User
CREATE OR REPLACE FUNCTION public.admin_unblock_user(target_user_id UUID)
RETURNS VOID AS $$
DECLARE
    user_phone TEXT;
BEGIN
    -- Get user phone
    SELECT phone INTO user_phone FROM public.users WHERE id = target_user_id;
    
    -- Update user status
    UPDATE public.users 
    SET is_blocked = false, block_reason = NULL, is_active = true
    WHERE id = target_user_id;
    
    -- Remove from blocked_phones
    DELETE FROM public.blocked_phones WHERE phone = user_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- RPC: Admin Delete User
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.users WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Policies for admin_settings (Admin only)
CREATE POLICY "Admins can do everything on admin_settings" ON public.admin_settings
    USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_super_admin = true));

-- Policies for ratings
CREATE POLICY "Ratings are viewable by everyone" ON public.ratings
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own ratings" ON public.ratings
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = rater_id));

CREATE POLICY "Users can update their own ratings" ON public.ratings
    FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = rater_id));

CREATE POLICY "Admins can delete ratings" ON public.ratings
    FOR DELETE USING (EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_super_admin = true));

-- Policies for blood_requests
CREATE POLICY "Users can view their own requests" ON public.blood_requests
    FOR SELECT USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = requester_id OR id = donor_id) OR EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND is_super_admin = true));

CREATE POLICY "Users can insert requests" ON public.blood_requests
    FOR INSERT WITH CHECK (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = requester_id));

CREATE POLICY "Users can update their own requests" ON public.blood_requests
    FOR UPDATE USING (auth.uid() IN (SELECT auth_id FROM public.users WHERE id = requester_id OR id = donor_id));
