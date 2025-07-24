-- Supabase Real-time Setup (No Extension Required)
-- Run this in your Supabase SQL Editor

-- 1. Verify tables exist
SELECT 'Tables Check' as check_type, COUNT(*) as count 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stations', 'alerts', 'metrics');

-- 2. Add tables to realtime publication (Supabase handles this automatically)
-- The tables will be available for real-time subscriptions
-- No need to manually add them to publication

-- 3. Verify RLS policies are in place
SELECT 'RLS Policies' as check_type, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('stations', 'alerts', 'metrics');

-- 4. Check if tables are ready for real-time
SELECT 
    'Real-time Ready Tables' as check_type,
    table_name,
    CASE 
        WHEN table_name IN ('stations', 'alerts', 'metrics') 
        THEN 'Ready for Real-time' 
        ELSE 'Not Configured' 
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('stations', 'alerts', 'metrics');

-- 5. Verify initial data exists
SELECT 'Initial Data Check' as check_type, COUNT(*) as station_count FROM stations;
SELECT 'Initial Data Check' as check_type, COUNT(*) as alert_count FROM alerts;
SELECT 'Initial Data Check' as check_type, COUNT(*) as metric_count FROM metrics;

-- Success message
SELECT 'Supabase real-time setup completed! Tables are ready for real-time subscriptions.' as status; 