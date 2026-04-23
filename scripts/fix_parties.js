import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naW1kd3FvYmpkZmx0d3lqdWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTk4NTQsImV4cCI6MjA5MjQ3NTg1NH0.NrWutPhUqlKDTYW4RwkpxD7xCz9CYWGwUEiqy6iAd84';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('contracts').select('id, partyA');
  if (error) {
    console.error(error);
    return;
  }
  
  let updated = 0;
  for (const c of data) {
    let newPartyA = c.partyA;
    if (c.partyA === '香港公司' || c.partyA === '星见空间技术有限公司') newPartyA = '星見空間技術有限公司';
    if (c.partyA === '杭州公司') newPartyA = '地卫二空间技术（杭州）有限公司';
    
    if (newPartyA !== c.partyA) {
      await supabase.from('contracts').update({ partyA: newPartyA }).eq('id', c.id);
      updated++;
      console.log(`Updated ${c.id}: ${c.partyA} -> ${newPartyA}`);
    }
  }
  console.log(`Finished updating ${updated} contracts.`);
}

main().catch(console.error);
