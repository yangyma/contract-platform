export const INITIAL_CATEGORIES = [
  { id: 'cat_1', name: '1_框架类协议', prefix: 'GJSCKJ' },
  { id: 'cat_2', name: '2_保密类协议', prefix: 'NDA' },
  { id: 'cat_3', name: '3_服务，采购类合同-杭州公司', prefix: 'CGHZ' },
  { id: 'cat_4', name: '4_采购类合同-香港公司', prefix: 'CGXG' },
  { id: 'cat_5', name: '5_投资类合同', prefix: 'TZ' },
  { id: 'cat_6', name: '6_销售类合同-杭州公司', prefix: 'XSHZ' },
  { id: 'cat_7', name: '7_销售类合同-香港公司', prefix: 'XSXG' }
];

export const OUR_PARTIES = [
  '地卫二空间技术（杭州）有限公司',
  '星見空間技術有限公司',
  '东方星链时空智能（山东）技术发展有限公司'
];

export const MOCK_USER_ADMIN = {
  id: 'u1',
  name: 'Admin User',
  role: 'admin',
  avatar: 'A'
};

export const MOCK_USER_EMPLOYEE = {
  id: 'u2',
  name: 'Employee User',
  role: 'employee',
  avatar: 'E'
};

export const MOCK_CONTRACTS = [
  {
    id: 'c1',
    number: 'CGHZ-26001',
    partyA: '杭州公司',
    partyB: '阿里巴巴云',
    title: '年度服务器采购合同',
    amount: '¥500,000',
    owner: '张三',
    date: '2026-01-15',
    paperArchived: '已归档',
    electronicArchived: '已归档',
    remarks: '加急处理',
    type: '3_服务，采购类合同-杭州公司',
    status: 'active',
    ownerId: 'u1'
  },
  {
    id: 'c2',
    number: 'XSXG-26001',
    partyA: '香港公司',
    partyB: 'Global Tech Ltd',
    title: '海外市场销售代理协议',
    amount: '$120,000',
    owner: '李四',
    date: '2026-02-01',
    paperArchived: '未归档',
    electronicArchived: '已归档',
    remarks: '纸质版邮寄中',
    type: '7_销售类合同-香港公司',
    status: 'active',
    ownerId: 'u1'
  },
  {
    id: 'c3',
    number: 'NDA-26001',
    partyA: '杭州公司',
    partyB: '某创新团队',
    title: '前期沟通保密协议(NDA)',
    amount: '-',
    owner: '王五',
    date: '2026-03-10',
    paperArchived: '已归档',
    electronicArchived: '已归档',
    remarks: '永久保密',
    type: '2_保密类协议',
    status: 'archived',
    ownerId: 'u2'
  },
  {
    id: 'c4',
    number: 'GJSCKJ-26002',
    title: 'Satellite Launch Service Agreement',
    type: '1_框架类协议',
    partyA: '地卫二空间技术（杭州）有限公司',
    partyB: 'SpaceX',
    amount: '$15,000,000',
    owner: 'Employee User',
    ownerId: 'u2',
    date: '2026-03-15',
    paperArchived: '未归档',
    electronicArchived: '已归档',
    remarks: 'Pending final payload review.',
    status: 'active'
  },
  {
    id: 'c5',
    number: 'XSHZ-26001',
    title: 'Earth Observation Data License',
    type: '6_销售类合同-杭州公司',
    partyA: '星见空间技术有限公司',
    partyB: 'Global Mapping Corp',
    amount: '¥800,000',
    owner: 'Employee User',
    ownerId: 'u2',
    date: '2026-04-10',
    paperArchived: '已归档',
    electronicArchived: '已归档',
    remarks: 'Standard data licensing agreement.',
    status: 'archived'
  }
];
