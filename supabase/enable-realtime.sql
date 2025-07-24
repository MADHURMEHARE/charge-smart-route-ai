-- Enable Real-time Extensions
-- Run this in your Supabase SQL Editor

-- 1. Enable the realtime extension
CREATE EXTENSION IF NOT EXISTS "realtime";

-- 2. Verify the extension is enabled
SELECT * FROM pg_extension WHERE extname = 'realtime';

-- 3. Check if tables are in the realtime publication
SELECT schemaname, tablename 
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';

-- 4. Add tables to realtime publication (if not already added)
ALTER PUBLICATION supabase_realtime ADD TABLE stations;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE metrics;

-- 5. Verify the setup
SELECT 
    'Real-time Extension Status' as check_type,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'realtime') 
        THEN 'Enabled' 
        ELSE 'Not Enabled' 
    END as status;

SELECT 
    'Tables in Realtime Publication' as check_type,
    COUNT(*) as table_count
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime'; 