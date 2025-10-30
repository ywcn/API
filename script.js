const SUPABASE_URL = 'https://usfwozrysezkrtwornts.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVzZndvenJ5c2V6a3J0d29ybnRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE3MDE4NjgsImV4cCI6MjA3NzI3Nzg2OH0.IMya7TkqCLFffYY56B1Q_baLoPu3irn1i5rutnnFWDA';
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const loginContainer = document.getElementById('login-container');
const dashboard = document.getElementById('dashboard');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginMsg = document.getElementById('login-msg');

document.getElementById('login-btn').onclick = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) return loginMsg.textContent = '❌ 登录失败：' + error.message;
  localStorage.setItem('sb_token', data.session.access_token);
  showDashboard();
};

document.getElementById('register-btn').onclick = async () => {
  const { data, error } = await supabase.auth.signUp({
    email: emailInput.value,
    password: passwordInput.value
  });
  if (error) return loginMsg.textContent = '❌ 注册失败：' + error.message;
  loginMsg.textContent = '✅ 注册成功，请验证邮箱后重新登录。';
};

const user = (await supabase.auth.getUser()).data.user;

const { data, error } = await supabase
  .from('roi_records')
  .insert([
    {
      user_id: user.id,           // 当前登录用户 ID
      project_name: '示例项目',
      cost: 100,                  // 必填
      revenue: 200,               // 必填
      roi: (200 - 100) / 100,     // 可选
      project_type: '测试类型',
      notes: '自动插入测试',
      created_at: new Date().toISOString()
    }
  ]);

console.log(data, error);

document.getElementById('logout-btn').onclick = async () => {
  await supabase.auth.signOut();
  localStorage.removeItem('sb_token');
  location.reload();
};

async function showDashboard() {
  loginContainer.style.display = 'none';
  dashboard.style.display = 'block';
  loadData();
}

document.getElementById('add-record').onclick = async () => {
  const project = document.getElementById('project-name').value;
  const cost = parseFloat(document.getElementById('cost').value);
  const revenue = parseFloat(document.getElementById('revenue').value);
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return alert('请重新登录');
  await supabase.from('roi_records').insert({
    user_id: user.user.id,
    project_name: project,
    cost, revenue
  });
  loadData();
};

async function loadData() {
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return;
  const { data } = await supabase.from('roi_records').select('*').eq('user_id', user.user.id);
  const tbody = document.querySelector('#data-table tbody');
  tbody.innerHTML = '';
  const labels = [], costData = [], revenueData = [];
  data.forEach(r => {
    const roi = ((r.revenue - r.cost) / r.cost * 100).toFixed(1);
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.project_name}</td><td>${r.cost}</td><td>${r.revenue}</td><td>${roi}%</td><td>${new Date(r.created_at).toLocaleString()}</td>`;
    tbody.appendChild(tr);
    labels.push(r.project_name); costData.push(r.cost); revenueData.push(r.revenue);
  });
  renderChart(labels, costData, revenueData);
}

let chart;
function renderChart(labels, costData, revenueData) {
  const ctx = document.getElementById('roiChart');
  if (chart) chart.destroy();
  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        { label: '投资', data: costData, backgroundColor: '#3b82f6' },
        { label: '收益', data: revenueData, backgroundColor: '#10b981' }
      ]
    }
  });
}
