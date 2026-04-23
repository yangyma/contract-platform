import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naW1kd3FvYmpkZmx0d3lqdWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTk4NTQsImV4cCI6MjA5MjQ3NTg1NH0.NrWutPhUqlKDTYW4RwkpxD7xCz9CYWGwUEiqy6iAd84';
const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { name: '李小珊', email: 'li.xiaoshan@star.vision' },
  { name: '胡斌', email: 'hu.bin@star.vision' },
  { name: '刘宇扬', email: 'liu.yuyang@star.vision' }
];

async function main() {
  for (const u of users) {
    let { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: '123456'
    });
    console.log(u.email, data?.user?.id ? 'Success' : 'Failed', error?.message || (data?.user?.identities?.length === 0 ? 'Fake success / Already registered' : ''));
  }
}

main().catch(console.error);
