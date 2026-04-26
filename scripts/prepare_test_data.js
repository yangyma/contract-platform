import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mgimdwqobjdfltwyjuba.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1naW1kd3FvYmpkZmx0d3lqdWJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4OTk4NTQsImV4cCI6MjA5MjQ3NTg1NH0.NrWutPhUqlKDTYW4RwkpxD7xCz9CYWGwUEiqy6iAd84';
const supabase = createClient(supabaseUrl, supabaseKey);

const usersList = [
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
  // 1. Delete all existing contracts
  console.log('Clearing existing contracts...');
  await supabase.from('contracts').delete().neq('id', '00000000-0000-0000-0000-000000000000');

  // 2. Fetch categories
  const { data: categories } = await supabase.from('categories').select('*');
  console.log(`Found ${categories.length} categories.`);

  // 3. Initialize sequence counters for each category
  const categoryCounters = {};
  categories.forEach(cat => {
    categoryCounters[cat.name] = 0;
  });

  const allNewContracts = [];
  const year = '26';

  // 4. First, gather all valid user IDs (only for those who still exist)
  const validUsers = [];
  for (const u of usersList) {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: u.email,
      password: '123456'
    });

    if (authError) {
      console.log(`  Skipping ${u.email} (likely removed or invalid)`);
      continue;
    }

    validUsers.push({ ...u, id: authData.user.id });
    await supabase.auth.signOut();
  }

  console.log(`\nStarting data generation for ${validUsers.length} valid users...`);

  // 5. Generate contracts sequentially
  // We want to loop by category first? Or loop by user but keep global counters?
  // User's request: "协议序号应该是按照顺序生成的"
  // Usually this means for Category A, the numbers are 1, 2, 3...
  
  for (const cat of categories) {
    for (const u of validUsers) {
      for (let i = 1; i <= 2; i++) {
        categoryCounters[cat.name]++;
        const currentSeq = categoryCounters[cat.name];
        
        let number = '';
        if (cat.name.includes('立项编号')) {
          number = `2026${cat.prefix}${currentSeq.toString().padStart(3, '0')}`;
        } else if (cat.prefix === 'GJSCBM') {
          number = `GJSCBM-${year}${currentSeq.toString().padStart(4, '0')}`;
        } else {
          number = `${cat.prefix}-${year}${currentSeq.toString().padStart(3, '0')}`;
        }

        allNewContracts.push({
          number: number,
          title: `测试合同_${cat.name}_${currentSeq}`,
          type: cat.name,
          partyA: '星見空間技術有限公司',
          partyB: `测试供应商_${currentSeq}`,
          amount: '¥' + (Math.random() * 5000 + 1000).toFixed(2),
          owner: u.name,
          date: '2026-04-23',
          paperArchived: '未归档',
          electronicArchived: '未归档',
          remarks: '按顺序生成的测试数据',
          status: 'active',
          ownerId: u.id
        });
      }
    }
  }

  console.log(`\nInserting ${allNewContracts.length} sequential contracts...`);

  for (let i = 0; i < allNewContracts.length; i += 50) {
    const batch = allNewContracts.slice(i, i + 50);
    const { error } = await supabase.from('contracts').insert(batch);
    if (error) console.error('Error:', error);
    else console.log(`  Inserted batch ${Math.floor(i/50) + 1}`);
  }

  console.log('Done!');
}

main();
