const initialTickets = [
  {
    id: "HD-1042",
    subject: "VPN access issue",
    priority: "Critical",
    status: "Open",
    engineer: "Ana Torres",
    comments: "3 comments",
    timeline: "10 min ago"
  },
  {
    id: "HD-1038",
    subject: "Printer installation request",
    priority: "High",
    status: "Pending",
    engineer: "Daniel Kim",
    comments: "1 comment",
    timeline: "25 min ago"
  },
  {
    id: "HD-1031",
    subject: "Email sync delayed",
    priority: "Medium",
    status: "Resolved",
    engineer: "Mina Patel",
    comments: "5 comments",
    timeline: "1 hr ago"
  },
  {
    id: "HD-1022",
    subject: "Password reset loop",
    priority: "Low",
    status: "Open",
    engineer: "Leo Grant",
    comments: "2 comments",
    timeline: "2 hrs ago"
  }
];

const state = {
  tickets: [...initialTickets],
  filteredTickets: [...initialTickets],
  priorityFilter: "all",
  statusFilter: "all",
  searchTerm: ""
};

const ticketTableBody = document.getElementById("ticketTableBody");
const searchInput = document.getElementById("searchInput");
const priorityFilter = document.getElementById("priorityFilter");
const statusFilter = document.getElementById("statusFilter");
const openCount = document.getElementById("openCount");
const resolvedCount = document.getElementById("resolvedCount");
const escalationCount = document.getElementById("escalationCount");
const modalBackdrop = document.getElementById("modalBackdrop");
const ticketForm = document.getElementById("ticketForm");

function getPriorityClass(priority) {
  return priority.toLowerCase();
}

function getStatusClass(status) {
  return status.toLowerCase();
}

function applyFilters() {
  state.filteredTickets = state.tickets.filter((ticket) => {
    const matchesPriority = state.priorityFilter === "all" || ticket.priority === state.priorityFilter;
    const matchesStatus = state.statusFilter === "all" || ticket.status === state.statusFilter;
    const query = state.searchTerm.toLowerCase();
    const matchesSearch = !query || [ticket.id, ticket.subject, ticket.engineer, ticket.comments].join(" ").toLowerCase().includes(query);
    return matchesPriority && matchesStatus && matchesSearch;
  });

  renderTickets();
  updateStats();
}

function updateStats() {
  const open = state.tickets.filter((ticket) => ticket.status === "Open").length;
  const resolved = state.tickets.filter((ticket) => ticket.status === "Resolved").length;
  const escalations = state.tickets.filter((ticket) => ticket.priority === "Critical").length;

  openCount.textContent = open;
  resolvedCount.textContent = resolved;
  escalationCount.textContent = escalations;
}

function renderTickets() {
  if (!state.filteredTickets.length) {
    ticketTableBody.innerHTML = '<tr><td colspan="7" style="text-align:center; padding:24px; color:#8fa2c6;">No tickets match the current filters.</td></tr>';
    return;
  }

  ticketTableBody.innerHTML = state.filteredTickets
    .map(
      (ticket) => `
        <tr>
          <td>${ticket.id}</td>
          <td>${ticket.subject}</td>
          <td><span class="badge ${getPriorityClass(ticket.priority)}">${ticket.priority}</span></td>
          <td><span class="badge ${getStatusClass(ticket.status)}">${ticket.status}</span></td>
          <td>${ticket.engineer}</td>
          <td>${ticket.comments}</td>
          <td>${ticket.timeline}</td>
        </tr>
      `
    )
    .join("");
}

function renderCharts() {
  const donutChart = document.getElementById("donutChart");
  donutChart.innerHTML = '<div class="donut"></div>';

  const barChart = document.getElementById("barChart");
  const workloads = [
    { name: "Ana", value: 78 },
    { name: "Daniel", value: 62 },
    { name: "Mina", value: 54 },
    { name: "Leo", value: 46 }
  ];

  barChart.innerHTML = workloads
    .map(
      (item) => `
        <div class="bar-item">
          <strong>${item.name}</strong>
          <div class="bar-track"><div class="bar-fill" style="width:${item.value}%"></div></div>
          <span>${item.value}%</span>
        </div>
      `
    )
    .join("");
}

function openModal() {
  modalBackdrop.classList.remove("hidden");
}

function closeModal() {
  modalBackdrop.classList.add("hidden");
  ticketForm.reset();
}

searchInput.addEventListener("input", (event) => {
  state.searchTerm = event.target.value;
  applyFilters();
});

priorityFilter.addEventListener("change", (event) => {
  state.priorityFilter = event.target.value;
  applyFilters();
});

statusFilter.addEventListener("change", (event) => {
  state.statusFilter = event.target.value;
  applyFilters();
});

document.getElementById("openModalBtn").addEventListener("click", openModal);
document.getElementById("closeModalBtn").addEventListener("click", closeModal);
document.getElementById("cancelBtn").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});

ticketForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(ticketForm);
  const newTicket = {
    id: `HD-${Math.floor(1000 + Math.random() * 9000)}`,
    subject: formData.get("subject"),
    priority: formData.get("priority"),
    status: formData.get("status"),
    engineer: formData.get("engineer"),
    comments: formData.get("comment") || "0 comments",
    timeline: "Just now"
  };

  state.tickets = [newTicket, ...state.tickets];
  state.filteredTickets = [...state.tickets];
  applyFilters();
  closeModal();
});

updateStats();
renderTickets();
renderCharts();
