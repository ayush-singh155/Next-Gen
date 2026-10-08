// Device inventory: mock dataset, search/filter/sort/pagination, CRUD
document.addEventListener('DOMContentLoaded', () => {
  const types = ['PC','Laptop','Router','Firewall','Switch','Server','Printer'];
  // create mock data
  const devices = [];
  for(let i=1;i<=15;i++){
    const t = types[i%types.length];
    devices.push({
      id:i,
      type:t,
      hostname:`${t.toLowerCase()}-${i}`,
      ip:`192.168.${Math.floor(i/255)}.${i%255}`,
      mac:`00:1A:2B:${(i%100).toString(16).padStart(2,'0')}:AB:${(i%50).toString(16).padStart(2,'0')}`,
      serial:`SN${100000+i}`,
      purchase: new Date(2020 + (i%4), i%12, (i%28)+1).toISOString().slice(0,10),
      warranty: 36,
      assigned: `User ${i}`,
      department: ['IT','Engineering','Support','Sales'][i%4],
      status: ['Active','Inactive','Maintenance','Decommissioned'][i%4]
    })
  }

  // state
  let state = {query:'',type:'',status:'',sort:'hostname',page:1,perPage:10};

  // Local persistence key
  const STORAGE_KEY = 'device_inventory_v1';

  // Load from localStorage if available
  function loadDevices(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if(raw){
        const parsed = JSON.parse(raw);
        if(Array.isArray(parsed) && parsed.length) return parsed;
      }
    }catch(e){ console.warn('Failed to load devices from storage', e); }
    return null;
  }

  function saveDevices(){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(devices)); }
    catch(e){ console.warn('Failed to save devices to storage', e); }
  }

  // Try hydrate from storage
  const fromStorage = loadDevices();
  if(fromStorage){
    // overwrite mock devices with persisted
    devices.length = 0; devices.push(...fromStorage);
  } else {
    // initial save of mock dataset
    saveDevices();
  }

  const tbody = document.querySelector('#deviceTable tbody');
  const searchInput = document.getElementById('searchInput');
  const typeFilter = document.getElementById('typeFilter');
  const statusFilter = document.getElementById('statusFilter');
  const perPage = document.getElementById('perPage');
  const pagination = document.getElementById('pagination');
  const addDeviceBtn = document.getElementById('addDeviceBtn');
  const modal = document.getElementById('deviceModal');
  const modalClose = document.getElementById('modalClose');
  const deviceForm = document.getElementById('deviceForm');

  function queryData(){
    let out = devices.slice();
    const q = state.query.trim().toLowerCase();
    if(q) out = out.filter(d => (d.hostname + d.ip + d.serial + d.assigned + d.department).toLowerCase().includes(q));
    if(state.type) out = out.filter(d=>d.type===state.type);
    if(state.status) out = out.filter(d=>d.status===state.status);
    out.sort((a,b)=> a[state.sort].toString().localeCompare(b[state.sort].toString()));
    const total = out.length; const totalPages = Math.max(1, Math.ceil(total/state.perPage));
    if(state.page>totalPages) state.page=totalPages;
    const start=(state.page-1)*state.perPage; const pageData = out.slice(start,start+state.perPage);
    return {pageData,total,totalPages}
  }

  function renderTable(){
    const {pageData,totalPages} = queryData();
    tbody.innerHTML='';
    pageData.forEach(d=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${d.type}</td>
        <td>${d.hostname}</td>
        <td>${d.ip}</td>
        <td>${d.mac}</td>
        <td>${d.serial}</td>
        <td>${d.purchase}</td>
        <td>${d.warranty} mo</td>
        <td>${d.assigned}</td>
        <td>${d.department}</td>
        <td><span class="badge-status">${d.status}</span></td>
        <td><button class="edit">Edit</button> <button class="del">Delete</button></td>
      `;
      tr.querySelector('.edit').addEventListener('click', ()=> openModal('edit', d.id));
      tr.querySelector('.del').addEventListener('click', ()=> removeDevice(d.id));
      tbody.appendChild(tr);
    });
    renderPagination(totalPages);
  }

  function renderPagination(totalPages){
    pagination.innerHTML='';
    for(let i=1;i<=totalPages;i++){
      const btn=document.createElement('button'); btn.textContent=i;
      if(i===state.page) btn.classList.add('active');
      btn.addEventListener('click', ()=>{state.page=i; renderTable();});
      pagination.appendChild(btn);
    }
  }

  // events
  searchInput.addEventListener('input', (e)=>{state.query=e.target.value; state.page=1; renderTable();});
  typeFilter.addEventListener('change', (e)=>{state.type=e.target.value; state.page=1; renderTable();});
  statusFilter.addEventListener('change', (e)=>{state.status=e.target.value; state.page=1; renderTable();});
  perPage.addEventListener('change', (e)=>{state.perPage=parseInt(e.target.value); state.page=1; renderTable();});
  document.querySelectorAll('th[data-sort]').forEach(th=>th.addEventListener('click', ()=>{state.sort=th.dataset.sort; renderTable();}));

  // CRUD modal
  function openModal(mode,id){
    modal.setAttribute('aria-hidden','false'); modal.style.display='flex';
    document.getElementById('modalTitle').textContent = mode==='add' ? 'Add Device' : 'Edit Device';
    if(mode==='edit'){
      const d = devices.find(x=>x.id===id);
      document.getElementById('deviceType').value = d.type;
      document.getElementById('hostname').value = d.hostname;
      document.getElementById('ip').value = d.ip;
      document.getElementById('mac').value = d.mac;
      document.getElementById('serial').value = d.serial;
      document.getElementById('purchase').value = d.purchase;
      document.getElementById('warranty').value = d.warranty;
      document.getElementById('assigned').value = d.assigned;
      document.getElementById('dept').value = d.department;
      document.getElementById('status').value = d.status;
      modal.dataset.editId = id;
    } else { deviceForm.reset(); delete modal.dataset.editId; }
  }
  addDeviceBtn.addEventListener('click', ()=> openModal('add'));
  modalClose.addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  function closeModal(){modal.setAttribute('aria-hidden','true'); modal.style.display='none';}

  deviceForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {type:document.getElementById('deviceType').value, hostname:document.getElementById('hostname').value, ip:document.getElementById('ip').value, mac:document.getElementById('mac').value, serial:document.getElementById('serial').value, purchase:document.getElementById('purchase').value, warranty:document.getElementById('warranty').value, assigned:document.getElementById('assigned').value, department:document.getElementById('dept').value, status:document.getElementById('status').value};
    if(modal.dataset.editId){
      const id=parseInt(modal.dataset.editId); const idx = devices.findIndex(x=>x.id===id); devices[idx]=Object.assign({id},devices[idx],data);
    } else { const id = devices.length?devices[devices.length-1].id+1:1; devices.push(Object.assign({id},data)); }
    // persist changes
    saveDevices();
    closeModal(); renderTable();
  });

  function removeDevice(id){ if(!confirm('Delete device?')) return; const idx = devices.findIndex(x=>x.id===id); if(idx>-1) devices.splice(idx,1); renderTable(); }

  // optional: sync to backend API (not called automatically)
  async function syncToAPI(endpoint){
    try{
      const res = await fetch(endpoint, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({devices})});
      return res.ok;
    }catch(e){ console.warn('Sync failed', e); return false; }
  }

  // init
  renderTable();
});
