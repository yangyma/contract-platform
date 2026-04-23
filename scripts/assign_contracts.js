import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naW1kd3FvYmpkZmx0d3lqdWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTk4NTQsImV4cCI6MjA5MjQ3NTg1NH0.NrWutPhUqlKDTYW4RwkpxD7xCz9CYWGwUEiqy6iAd84';
const supabase = createClient(supabaseUrl, supabaseKey);

const users = [
  { name: '黄希旺', email: 'huang.xiwang@star.vision' },
  { name: '魏拓欣', email: 'wei.tuoxin@star.vision' },
  { name: '李小珊', email: 'li.xiaoshan@star.vision' },
  { name: '胡斌', email: 'hu.bin@star.vision' },
  { name: '刘宇扬', email: 'liu.yuyang@star.vision' },
  { name: '李卓合', email: 'li.zhuohe@star.vision' },
  { name: 'Ali Shah', email: 'ali.shah@star.vision' },
  { name: '裘健翔', email: 'qiu.jianxiang@star.vision' },
  { name: '黄澳', email: 'huang.ao@star.vision' },
  { name: '傅乐勇', email: 'fu.leyong@star.vision' },
  { name: 'Noor Fan', email: 'fan.lianghua@star.vision' },
  { name: '刘斌', email: 'liu.bin@star.vision' },
  { name: '周玉森', email: 'zhou.yusen@star.vision' },
  { name: '吴梁韬', email: 'wu.liangtao@star.vision' },
  { name: '马扬玥', email: 'ma.yangyue@star.vision' },
  { name: '林宇轩', email: 'lin.yuxuan@star.vision' },
  { name: '廖振华', email: 'liao.zhenhua@star.vision' },
  { name: '张天霖', email: 'zhang.tianlin@star.vision' },
  { name: '艾奕帆', email: 'ai.yifan@star.vision' },
  { name: '范钰', email: 'fan.yu@star.vision' },
  { name: '王志超', email: 'wang.zhichao@star.vision' },
  { name: '程福建', email: 'cheng.fujian@star.vision' },
  { name: '王锦平', email: 'wang.jinping@star.vision' },
  { name: '唐振坤', email: 'tang.zhenkun@star.vision' },
  { name: '郭一博', email: 'guo.yibo@star.vision' },
  { name: '孙殿东', email: 'sun.diandong@star.vision' },
  { name: '赵予菲', email: 'zhao.yufei@star.vision' },
  { name: '胡维昊', email: 'hu.weihao@star.vision' }
];

async function main() {
  const userMap = new Map();

  for (const u of users) {
    console.log(`Processing user: ${u.email}`);
    // Register
    let { data, error } = await supabase.auth.signUp({
      email: u.email,
      password: '123456'
    });
    
    // Check if sign-in is needed
    if (!data.user || !data.user.id || data.user.identities?.length === 0) {
      console.log(`  Already registered, trying sign-in...`);
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: u.email,
        password: '123456'
      });
      if (signInError) {
        console.error(`  Failed to sign in: ${signInError.message}`);
      } else {
        userMap.set(u.name, signInData.user.id);
        console.log(`  Logged in as ${u.name} - ${signInData.user.id}`);
      }
    } else if (data.user) {
      userMap.set(u.name, data.user.id);
      console.log(`  Registered ${u.name} - ${data.user.id}`);
    } else {
      console.error(`  Failed to process ${u.name}:`, error);
    }
    
    // Add variations for matching
    if (u.name.includes(' ')) {
      userMap.set(u.name.split(' ')[0], userMap.get(u.name));
    }
  }
  
  // Also add 'Fan Lianghua' for Noor Fan
  if (userMap.has('Noor Fan')) {
    userMap.set('Fan Lianghua', userMap.get('Noor Fan'));
    userMap.set('范良华', userMap.get('Noor Fan')); // just in case
  }

  console.log(`\nFound ${userMap.size} user mappings.`);

  // Get Ma Yangyue's ID
  const maId = userMap.get('马扬玥');
  if (!maId) {
    console.error('Could not find Ma Yangyue ID, aborting contract assignment.');
    return;
  }
  
  console.log(`\nFetching contracts owned by Ma Yangyue (${maId})...`);
  const { data: contracts, error: contractsError } = await supabase
    .from('contracts')
    .select('*')
    .eq('ownerId', maId);
    
  if (contractsError) {
    console.error('Error fetching contracts:', contractsError);
    return;
  }
  
  console.log(`Found ${contracts.length} contracts.`);
  
  let updatedCount = 0;
  for (const c of contracts) {
    let newOwnerId = null;
    
    // Check if the owner field matches anyone in userMap
    for (const [name, id] of userMap.entries()) {
      if (c.owner && c.owner.includes(name)) {
        newOwnerId = id;
        break;
      }
    }
    
    if (newOwnerId && newOwnerId !== maId) {
      console.log(`Reassigning contract ${c.number} (owner: ${c.owner}) -> ${newOwnerId}`);
      const { error: updateError } = await supabase
        .from('contracts')
        .update({ ownerId: newOwnerId })
        .eq('id', c.id);
        
      if (updateError) {
        console.error(`Failed to update ${c.number}:`, updateError);
      } else {
        updatedCount++;
      }
    }
  }
  
  console.log(`\nSuccessfully reassigned ${updatedCount} contracts.`);
}

main().catch(console.error);
