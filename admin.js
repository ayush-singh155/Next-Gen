// Admin dashboard interactions and Chart.js initialization
document.addEventListener('DOMContentLoaded', () => {
  // Sidebar toggle (for small screens)
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  sidebarToggle.addEventListener('click', () => {
    sidebar.classList.toggle('collapsed');
    sidebarToggle.setAttribute('aria-pressed', sidebar.classList.contains('collapsed'));
  });

  // Profile dropdown
  const profileBtn = document.getElementById('profileBtn');
  const profileMenu = document.getElementById('profileMenu');
  profileBtn.addEventListener('click', (e) => {
    const open = profileMenu.style.display === 'flex';
    profileMenu.style.display = open ? 'none' : 'flex';
    profileBtn.setAttribute('aria-expanded', String(!open));
  });

  // Simple search focus behavior
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('focus', () => searchInput.parentElement.classList.add('focused'));
  searchInput.addEventListener('blur', () => searchInput.parentElement.classList.remove('focused'));

  // Initialize progress bars
  document.querySelectorAll('.progress').forEach(el => {
    const val = parseFloat(el.getAttribute('data-value') || '0');
    const fill = el.querySelector('span');
    setTimeout(() => { fill.style.width = `${val}%`; }, 200);
  });

  // Charts setup
  // Line chart - traffic
  const ctxLine = document.getElementById('lineChart').getContext('2d');
  const lineChart = new Chart(ctxLine, {
    type: 'line',
    data: {
      labels: ['00:00','04:00','08:00','12:00','16:00','20:00','24:00'],
      datasets: [{
        label: 'Inbound (Mbps)',
        data: [120,180,95,240,210,300,260],
        borderColor: '#61dafb',
        backgroundColor: 'rgba(97,218,251,0.08)',
        tension: 0.4,
        pointRadius:3
      },{
        label: 'Outbound (Mbps)',
        data: [80,120,60,160,120,200,170],
        borderColor: '#9b8cff',
        backgroundColor: 'rgba(155,140,255,0.06)',
        tension:0.4,
        pointRadius:3
      }]
    },
    options: {
      responsive:true,maintainAspectRatio:false,
      plugins:{legend:{display:true,labels:{color:'#cfe9ff'}}},
      scales:{x:{ticks:{color:'#9fbfe8'}},y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'#9fbfe8'}}}
    }
  });

  // Doughnut chart - devices
  const ctxDough = document.getElementById('doughnutChart').getContext('2d');
  const doughnutChart = new Chart(ctxDough, {
    type:'doughnut',data:{labels:['Routers','Switches','APs','Servers'],datasets:[{data:[420,1200,800,300],backgroundColor:['#00b4ff','#8a2be2','#5ee7df','#ffc46b']}]},options:{plugins:{legend:{position:'bottom',labels:{color:'#cfe9ff'}}}}
  });

  // Bar chart - tickets
  const ctxBar = document.getElementById('barChart').getContext('2d');
  const barChart = new Chart(ctxBar,{type:'bar',data:{labels:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],datasets:[{label:'Open Tickets',data:[12,19,7,14,22,9,6],backgroundColor:'#8a2be2'}]},options:{plugins:{legend:{display:false}},scales:{x:{ticks:{color:'#9fbfe8'}},y:{ticks:{color:'#9fbfe8'}}}});

  // Simulate live updates (demo)
  setInterval(()=>{
    const last = Math.max(0, Math.round(200 + Math.random()*120));
    lineChart.data.datasets[0].data.shift(); lineChart.data.datasets[0].data.push(last);
    lineChart.update();
  },5000);
});
