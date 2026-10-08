// IPAM dashboard: mock data, CRUD, search/filter, charts, local persistence
document.addEventListener('DOMContentLoaded', () => {
  const STORAGE_KEY = 'ipam_v1';

  // sample subnets
  const SUBNETS = ['192.168.1.0/24','192.168.2.0/24','10.0.0.0/24'];

  // create or load devices
  function load(){
    try{ const raw = localStorage.getItem(STORAGE_KEY); if(raw) return JSON.parse(raw); }
    catch(e){console.warn('load',e)}
    // generate sample IPs
    const arr=[]; let id=1;
    for(const sn of SUBNETS){
      for(let i=2;i<40;i+=3){
        arr.push({id:id++,ip:sn.replace(/0\/24/,i),subnet:sn,gateway:sn.replace(/0\/24/,1),dns:'8.8.8.8',hostname:`host-${id}`,mac:`00:1A:2B:${(id%100).toString(16)}:AA:${(id%50).toString(16)}`,serial:`SN${1000+id}`,purchase:'2022-03-01',warranty:36,assigned:`User ${id}`,department:['IT','Engineering','Support'][id%3],status: (i%5===0)?'Reserved':'Active'});
      }
    }
    return arr;
  }

  let records = load();
  function save(){ try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(records)); }catch(e){console.warn(e)} }

  // elements
  const tbody = document.querySelector('#ipTable tbody');
  const searchEl = document.getElementById('search');
  const filterSubnet = document.getElementById('filterSubnet');
  const filterDept = document.getElementById('filterDept');
  const filterStatus = document.getElementById('filterStatus');
  const addBtn = document.getElementById('addIpBtn');
  const modal = document.getElementById('ipModal');
  const modalClose = document.getElementById('modalClose');
  const ipForm = document.getElementById('ipForm');

  // populate subnet selects
  const subnetSelect = document.getElementById('subnetSelect');
  SUBNETS.forEach(s=>{ const opt=document.createElement('option'); opt.value=s; opt.textContent=s; subnetSelect.appendChild(opt); const opt2=document.createElement('option'); opt2.value=s; opt2.textContent=s; filterSubnet.appendChild(opt2); });

  // render table
  function render(){
    const q = searchEl.value.trim().toLowerCase(); const sn = filterSubnet.value; const dept = filterDept.value; const st = filterStatus.value;
    tbody.innerHTML='';
    const filtered = records.filter(r=>{
      if(sn && r.subnet!==sn) return false;
      if(dept && r.department!==dept) return false;
      if(st && r.status!==st) return false;
      if(q && !(r.ip+r.hostname+r.mac+r.serial+r.assigned+r.department).toLowerCase().includes(q)) return false;
      return true;
    });
    filtered.forEach(r=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${r.ip}</td><td>${r.subnet}</td><td>${r.gateway}</td><td>${r.dns}</td><td>${r.hostname}</td><td>${r.mac}</td><td>${r.serial}</td><td>${r.purchase}</td><td>${r.warranty}</td><td>${r.assigned}</td><td>${r.department}</td><td>${r.status}</td><td><button class="edit">Edit</button> <button class="del">Delete</button></td>`;
      tr.querySelector('.edit').addEventListener('click', ()=> openModal('edit', r.id));
      tr.querySelector('.del').addEventListener('click', ()=> removeRecord(r.id));
      tbody.appendChild(tr);
    });
    updateCharts();
  }

  // CRUD
  function openModal(mode,id){ modal.setAttribute('aria-hidden','false'); modal.style.display='flex'; document.getElementById('modalTitle').textContent = mode==='add'?'Add IP':'Edit IP'; if(mode==='edit'){ const rec = records.find(x=>x.id===id); document.getElementById('ipAddress').value=rec.ip; document.getElementById('subnetSelect').value=rec.subnet; document.getElementById('gateway').value=rec.gateway; document.getElementById('dns').value=rec.dns; document.getElementById('hostname').value=rec.hostname; document.getElementById('mac').value=rec.mac; document.getElementById('serial').value=rec.serial; document.getElementById('purchase').value=rec.purchase; document.getElementById('warranty').value=rec.warranty; document.getElementById('assigned').value=rec.assigned; document.getElementById('department').value=rec.department; document.getElementById('status').value=rec.status; modal.dataset.editId = id; } else { ipForm.reset(); delete modal.dataset.editId; } }
  function closeModal(){ modal.setAttribute('aria-hidden','true'); modal.style.display='none'; }

  addBtn.addEventListener('click', ()=> openModal('add'));
  modalClose.addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);

  ipForm.addEventListener('submit', (e)=>{ e.preventDefault(); const data={ ip:document.getElementById('ipAddress').value, subnet:document.getElementById('subnetSelect').value, gateway:document.getElementById('gateway').value, dns:document.getElementById('dns').value, hostname:document.getElementById('hostname').value, mac:document.getElementById('mac').value, serial:document.getElementById('serial').value, purchase:document.getElementById('purchase').value, warranty:document.getElementById('warranty').value, assigned:document.getElementById('assigned').value, department:document.getElementById('department').value, status:document.getElementById('status').value };
    if(modal.dataset.editId){ const id=parseInt(modal.dataset.editId); const idx = records.findIndex(x=>x.id===id); records[idx]=Object.assign({id},records[idx],data); } else { const id = records.length?records[records.length-1].id+1:1; records.push(Object.assign({id},data)); }
    save(); closeModal(); render(); });

  function removeRecord(id){ if(!confirm('Delete IP record?')) return; const idx = records.findIndex(x=>x.id===id); if(idx>-1) records.splice(idx,1); save(); render(); }

  // Charts
  let statusChart, subnetChart;
  function updateCharts(){
    const statusCounts = records.reduce((acc,r)=>{acc[r.status]=(acc[r.status]||0)+1; return acc;},{})
    const statuses = Object.keys(statusCounts); const statusData = statuses.map(s=>statusCounts[s]);
    if(!statusChart){ const ctx=document.getElementById('statusChart').getContext('2d'); statusChart = new Chart(ctx,{type:'doughnut',data:{labels:statuses,datasets:[{data:statusData,backgroundColor:['#00b4ff','#8a2be2','#5ee7df','#ffc46b']}]},options:{plugins:{legend:{position:'bottom'}}}}); }
    else{ statusChart.data.labels=statuses; statusChart.data.datasets[0].data=statusData; statusChart.update(); }

    // subnet utilization
    const subnetCounts = records.reduce((acc,r)=>{acc[r.subnet]=(acc[r.subnet]||0)+1; return acc;},{})
    const subs = Object.keys(subnetCounts); const subData = subs.map(s=>subnetCounts[s]);
    if(!subnetChart){ const ctx2=document.getElementById('subnetChart').getContext('2d'); subnetChart = new Chart(ctx2,{type:'bar',data:{labels:subs,datasets:[{label:'Assigned IPs',data:subData,backgroundColor:'#8a2be2'}]},options:{scales:{y:{beginAtZero:true}}}}); }
    else{ subnetChart.data.labels=subs; subnetChart.data.datasets[0].data=subData; subnetChart.update(); }
  }

  // filters
  searchEl.addEventListener('input', render); filterSubnet.addEventListener('change', render); filterDept.addEventListener('change', render); filterStatus.addEventListener('change', render);

  // initial render
  render();

  // optional: helper to sync to API
  async function syncToAPI(endpoint){ try{ const res = await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(records)}); return res.ok;}catch(e){console.warn('sync',e);return false;} }
});
