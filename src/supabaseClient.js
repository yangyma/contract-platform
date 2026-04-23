import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naW1kd3FvYmpkZmx0d3lqdWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTk4NTQsImV4cCI6MjA5MjQ3NTg1NH0.NrWutPhUqlKDTYW4RwkpxD7xCz9CYWGwUEiqy6iAd84';

export const supabase = createClient(supabaseUrl, supabaseKey);
