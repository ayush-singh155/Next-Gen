// Employee management interactions: search, filter, sort, pagination, modals
document.addEventListener('DOMContentLoaded', () => {
  // Mock data
  const employees = [];
  for (let i=1;i<=10;i++){
    employees.push({
      id:i,
      first:`First${i}`,
      last:`Last${i}`,
      name:`First${i} Last${i}`,
      department: ['Engineering','IT','Support','Sales'][i%4],
      role: ['Engineer','Manager','Technician','Analyst'][i%4],
      email:`user${i}@example.com`,
      phone:`+1 (555) 01${String(i).padStart(2,'0')}`,
      status: (i%7===0)?'On Leave':'Active'
    })
  }

  // State
  let state = {query:'',dept:'',sort:'name',page:1,perPage:10,view:'table'};

  // Elements
  const tableBody = document.querySelector('#employeeTable tbody');
  const cardsList = document.getElementById('cardsList');
  const cardsWrap = document.getElementById('cardsWrap');
  const tableWrap = document.getElementById('tableWrap');
  const searchEl = document.getElementById('search');
  const deptFilter = document.getElementById('departmentFilter');
  const perPageEl = document.getElementById('perPage');
  const paginationEl = document.getElementById('pagination');
  const tableViewBtn = document.getElementById('tableViewBtn');
  const cardViewBtn = document.getElementById('cardViewBtn');

  const modal = document.getElementById('modal');
  const modalTitle = document.getElementById('modalTitle');
  const modalClose = document.getElementById('modalClose');
  const addBtn = document.getElementById('addEmployeeBtn');
  const employeeForm = document.getElementById('employeeForm');

  function filterSortPaginate(){
    let out = employees.slice();
    // search
    const q = state.query.trim().toLowerCase();
    if(q){out = out.filter(e=> (e.name+e.email+e.role+e.department).toLowerCase().includes(q));}
    // dept
    if(state.dept){out = out.filter(e=> e.department===state.dept)}
    // sort
    out.sort((a,b)=> a[state.sort].toString().localeCompare(b[state.sort].toString()));
    // pagination
    const total = out.length; const totalPages = Math.max(1,Math.ceil(total/state.perPage));
    if(state.page>totalPages) state.page=totalPages;
    const start=(state.page-1)*state.perPage; const pageData = out.slice(start,start+state.perPage);
    return {pageData,total,totalPages}
  }

  function renderTable(){
    const {pageData}=filterSortPaginate();
    tableBody.innerHTML='';
    pageData.forEach(e=>{
      const tr=document.createElement('tr');
      tr.innerHTML=`
        <td><div class="flex"><div class="avatar">${initials(e.name)}</div><div class="name">${e.name}</div></div></td>
        <td><span class="dept-badge">${e.department}</span></td>
        <td>${e.role}</td>
        <td>${e.email}</td>
        <td>${e.phone}</td>
        <td><span class="badge">${e.status}</span></td>
        <td><button class="edit">Edit</button> <button class="del">Delete</button></td>
      `;
      // actions
      tr.querySelector('.edit').addEventListener('click', ()=> openModal('edit', e.id));
      tr.querySelector('.del').addEventListener('click', ()=> removeEmployee(e.id));
      tableBody.appendChild(tr);
    })
  }

  function renderCards(){
    const {pageData}=filterSortPaginate();
    cardsList.innerHTML='';
    pageData.forEach(e=>{
      const tpl = document.getElementById('cardTemplate').content.cloneNode(true);
      tpl.querySelector('.avatar').textContent = initials(e.name);
      tpl.querySelector('.name').textContent = e.name;
      tpl.querySelector('.role').textContent = e.role;
      tpl.querySelector('.dept').textContent = e.department;
      tpl.querySelector('.email').textContent = e.email;
      tpl.querySelector('.phone').textContent = e.phone;
      tpl.querySelector('.status').textContent = e.status;
      tpl.querySelector('.edit').addEventListener('click', ()=> openModal('edit', e.id));
      tpl.querySelector('.del').addEventListener('click', ()=> removeEmployee(e.id));
      cardsList.appendChild(tpl);
    })
  }

  function renderPagination(totalPages){
    paginationEl.innerHTML='';
    for(let i=1;i<=totalPages;i++){
      const btn=document.createElement('button'); btn.textContent=i;
      if(i===state.page) btn.classList.add('active');
      btn.addEventListener('click',()=>{state.page=i; rerender();});
      paginationEl.appendChild(btn);
    }
  }

  function rerender(){
    const {totalPages}=filterSortPaginate();
    if(state.view==='table'){tableWrap.hidden=false;cardsWrap.hidden=true; renderTable();}
    else {tableWrap.hidden=true;cardsWrap.hidden=false; renderCards();}
    renderPagination(totalPages);
  }

  function initials(name){return name.split(' ').map(n=>n[0]).slice(0,2).join('').toUpperCase()}

  // events
  searchEl.addEventListener('input', (e)=>{state.query=e.target.value; state.page=1; rerender();});
  deptFilter.addEventListener('change',(e)=>{state.dept=e.target.value; state.page=1; rerender();});
  perPageEl.addEventListener('change',(e)=>{state.perPage=parseInt(e.target.value); state.page=1; rerender();});
  document.querySelectorAll('th[data-sort]').forEach(th=>{
    th.addEventListener('click',()=>{state.sort=th.dataset.sort; rerender();});
  });

  tableViewBtn.addEventListener('click', ()=>{state.view='table'; tableViewBtn.classList.add('active'); cardViewBtn.classList.remove('active'); tableViewBtn.setAttribute('aria-pressed','true'); cardViewBtn.setAttribute('aria-pressed','false'); rerender();});
  cardViewBtn.addEventListener('click', ()=>{state.view='card'; cardViewBtn.classList.add('active'); tableViewBtn.classList.remove('active'); cardViewBtn.setAttribute('aria-pressed','true'); tableViewBtn.setAttribute('aria-pressed','false'); rerender();});

  // Modal handling
  function openModal(mode, id){
    modal.setAttribute('aria-hidden','false'); modal.style.display='flex';
    modalTitle.textContent = mode==='add' ? 'Add Employee' : 'Edit Employee';
    // populate when edit
    if(mode==='edit'){
      const emp = employees.find(x=>x.id===id);
      document.getElementById('firstName').value = emp.first;
      document.getElementById('lastName').value = emp.last;
      document.getElementById('email').value = emp.email;
      document.getElementById('phone').value = emp.phone;
      document.getElementById('dept').value = emp.department;
      document.getElementById('role').value = emp.role;
      document.getElementById('status').value = emp.status;
      modal.dataset.editId = id;
    } else {
      employeeForm.reset(); delete modal.dataset.editId;
    }
  }
  modalClose.addEventListener('click', closeModal);
  document.getElementById('cancelBtn').addEventListener('click', closeModal);
  addBtn.addEventListener('click', ()=> openModal('add'));
  function closeModal(){ modal.setAttribute('aria-hidden','true'); modal.style.display='none'; }

  employeeForm.addEventListener('submit', (e)=>{
      e.preventDefault();
      const data = {first:document.getElementById('firstName').value.trim(), last:document.getElementById('lastName').value.trim(), name:document.getElementById('firstName').value.trim()+' '+document.getElementById('lastName').value.trim(), email:document.getElementById('email').value.trim(), phone:document.getElementById('phone').value.trim(), department:document.getElementById('dept').value, role:document.getElementById('role').value, status:document.getElementById('status').value };
      if(modal.dataset.editId){
        const id = parseInt(modal.dataset.editId);
        const idx = employees.findIndex(x=>x.id===id); employees[idx]=Object.assign({id},employees[idx],data);
      } else {
        const id = employees.length?employees[employees.length-1].id+1:1; employees.push(Object.assign({id},data));
      }
      // persist to localStorage
      try{ localStorage.setItem('employees_v1', JSON.stringify(employees)); }catch(e){console.warn('Failed to save employees',e)}
      closeModal(); rerender();
  });

  function removeEmployee(id){
    if(!confirm('Delete this employee?')) return; const idx = employees.findIndex(x=>x.id===id); if(idx>-1) employees.splice(idx,1); rerender();
  }

  // Initialize
  rerender();
});
