import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'sb_publishable_iZ6eUxi83LV2Uv-eLGdm3A_EyjuInA2';

export const supabase = createClient(supabaseUrl, supabaseKey);
