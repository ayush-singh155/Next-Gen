const commonOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { labels: { color: '#f4f7ff' } } },
  scales: {
    x: { ticks: { color: '#8ea1c2' }, grid: { color: 'rgba(255,255,255,0.08)' } },
    y: { ticks: { color: '#8ea1c2' }, grid: { color: 'rgba(255,255,255,0.08)' } }
  }
};

function createChart(canvasId, config) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, config);
}

createChart('lineChart', {
  type: 'line',
  data: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Traffic',
      data: [42, 58, 49, 74, 68, 82, 90],
      borderColor: '#6fe7ff',
      backgroundColor: 'rgba(111,231,255,0.18)',
      fill: true,
      tension: 0.35,
      pointRadius: 4,
      pointBackgroundColor: '#f4f7ff'
    }]
  },
  options: commonOptions
});

createChart('pieChart', {
  type: 'doughnut',
  data: {
    labels: ['Laptops', 'Phones', 'Servers', 'IoT'],
    datasets: [{
      data: [35, 22, 28, 15],
      backgroundColor: ['#6fe7ff', '#8c7dff', '#43e196', '#ffbf69']
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'bottom', labels: { color: '#f4f7ff' } } }
  }
});

createChart('barChart', {
  type: 'bar',
  data: {
    labels: ['CPU', 'RAM', 'Disk', 'Cache'],
    datasets: [{
      label: 'Load %',
      data: [78, 64, 52, 71],
      backgroundColor: ['#6fe7ff', '#8c7dff', '#43e196', '#ffbf69']
    }]
  },
  options: commonOptions
});

createChart('areaChart', {
  type: 'line',
  data: {
    labels: ['00', '04', '08', '12', '16', '20', '24'],
    datasets: [{
      label: 'Bandwidth',
      data: [100, 180, 220, 280, 250, 320, 360],
      borderColor: '#8c7dff',
      backgroundColor: 'rgba(140,125,255,0.2)',
      fill: true,
      tension: 0.3,
      pointRadius: 0
    }]
  },
  options: commonOptions
});
