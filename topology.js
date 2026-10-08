const BOARD_WIDTH = 1000;
const BOARD_HEIGHT = 600;

const initialNodes = [
  { id: "internet", name: "Internet", type: "edge", x: 120, y: 110, icon: "🌐" },
  { id: "firewall", name: "Firewall", type: "security", x: 320, y: 170, icon: "🛡️" },
  { id: "router", name: "Router", type: "core", x: 530, y: 240, icon: "🔀" },
  { id: "switch", name: "Switch", type: "access", x: 710, y: 180, icon: "🔌" },
  { id: "servers", name: "Servers", type: "compute", x: 730, y: 410, icon: "🖥️" },
  { id: "pc", name: "PC", type: "compute", x: 470, y: 460, icon: "💻" },
  { id: "laptop", name: "Laptop", type: "access", x: 250, y: 400, icon: "💻" }
];

const state = {
  zoom: 1,
  nodes: structuredClone(initialNodes),
  selectedId: "router",
  dragId: null,
  dragOffset: { x: 0, y: 0 }
};

const viewport = document.getElementById("viewport");
const boardCanvas = document.getElementById("boardCanvas");
const nodesLayer = document.getElementById("nodesLayer");
const connectionsLayer = document.getElementById("connectionsLayer");
const miniMapViewport = document.getElementById("miniMapViewport");
const miniMapSvg = document.getElementById("miniMapSvg");

function buildConnectionPath(fromNode, toNode) {
  const dx = toNode.x - fromNode.x;
  const dy = toNode.y - fromNode.y;
  const curveX1 = fromNode.x + dx * 0.35;
  const curveY1 = fromNode.y + dy * 0.12 - 40;
  const curveX2 = fromNode.x + dx * 0.65;
  const curveY2 = fromNode.y + dy * 0.12 + 40;

  return `M ${fromNode.x} ${fromNode.y} C ${curveX1} ${curveY1}, ${curveX2} ${curveY2}, ${toNode.x} ${toNode.y}`;
}

function renderConnections() {
  const paths = [
    ["internet", "firewall"],
    ["firewall", "router"],
    ["router", "switch"],
    ["router", "pc"],
    ["router", "servers"],
    ["switch", "laptop"],
    ["switch", "servers"]
  ];

  const svgMarkup = paths
    .map(([fromId, toId]) => {
      const fromNode = state.nodes.find((node) => node.id === fromId);
      const toNode = state.nodes.find((node) => node.id === toId);
      if (!fromNode || !toNode) {
        return "";
      }
      return `<path class="connection-line" d="${buildConnectionPath(fromNode, toNode)}"></path>`;
    })
    .join("");

  connectionsLayer.innerHTML = svgMarkup;
}

function renderNodes() {
  nodesLayer.innerHTML = state.nodes
    .map((node) => {
      const isActive = state.selectedId === node.id;
      const isDragging = state.dragId === node.id;
      return `
        <button
          class="node ${isActive ? "is-active" : ""} ${isDragging ? "is-dragging" : ""}"
          data-node-id="${node.id}"
          style="left:${node.x}px; top:${node.y}px;"
          type="button"
          aria-label="${node.name}"
        >
          <span class="node-icon">${node.icon}</span>
          <span class="node-label">${node.name}</span>
          <span class="node-meta">${node.type}</span>
        </button>
      `;
    })
    .join("");

  boardCanvas.style.transform = `scale(${state.zoom})`;
  boardCanvas.style.width = `${BOARD_WIDTH}px`;
  boardCanvas.style.height = `${BOARD_HEIGHT}px`;
}

function updateMiniMap() {
  miniMapSvg.innerHTML = `
    <rect x="0" y="0" width="1000" height="600" fill="rgba(255,255,255,0.04)"></rect>
    <g fill="rgba(114,241,255,0.72)">
      ${state.nodes
        .map(
          (node) => `
            <circle cx="${node.x}" cy="${node.y}" r="8" fill="${state.selectedId === node.id ? "#8b7dff" : "#72f1ff"}"></circle>
          `
        )
        .join("")}
    </g>
  `;

  const viewportScale = Math.max(18, 100 / state.zoom);
  miniMapViewport.style.width = `${viewportScale}%`;
  miniMapViewport.style.height = `${viewportScale}%`;
}

function renderTopology() {
  renderConnections();
  renderNodes();
  updateMiniMap();
}

function toBoardCoordinates(clientX, clientY) {
  const rect = viewport.getBoundingClientRect();
  return {
    x: (clientX - rect.left) / state.zoom,
    y: (clientY - rect.top) / state.zoom
  };
}

function startDrag(nodeId, clientX, clientY) {
  const node = state.nodes.find((entry) => entry.id === nodeId);
  if (!node) return;

  const coords = toBoardCoordinates(clientX, clientY);
  state.dragId = nodeId;
  state.selectedId = nodeId;
  state.dragOffset = {
    x: coords.x - node.x,
    y: coords.y - node.y
  };

  renderTopology();
}

function moveDrag(clientX, clientY) {
  if (!state.dragId) return;
  const coords = toBoardCoordinates(clientX, clientY);
  const draggingNode = state.nodes.find((entry) => entry.id === state.dragId);
  if (!draggingNode) return;

  draggingNode.x = Math.min(BOARD_WIDTH, Math.max(40, coords.x - state.dragOffset.x));
  draggingNode.y = Math.min(BOARD_HEIGHT, Math.max(40, coords.y - state.dragOffset.y));

  renderTopology();
}

function endDrag() {
  state.dragId = null;
  renderTopology();
}

function applyZoom(delta) {
  state.zoom = Math.min(1.8, Math.max(0.8, state.zoom + delta));
  renderTopology();
}

function resetView() {
  state.zoom = 1;
  state.nodes = structuredClone(initialNodes);
  state.selectedId = "router";
  renderTopology();
}

function focusCore() {
  state.zoom = 1.15;
  state.selectedId = "router";
  state.nodes = structuredClone(initialNodes).map((node) => {
    if (node.id === "router") {
      return { ...node, x: 500, y: 260 };
    }
    return node;
  });
  renderTopology();
}

nodesLayer.addEventListener("pointerdown", (event) => {
  const button = event.target.closest(".node");
  if (!button) return;
  event.preventDefault();
  const nodeId = button.dataset.nodeId;
  startDrag(nodeId, event.clientX, event.clientY);
});

window.addEventListener("pointermove", (event) => {
  moveDrag(event.clientX, event.clientY);
});

window.addEventListener("pointerup", endDrag);
window.addEventListener("pointercancel", endDrag);

window.addEventListener("keydown", (event) => {
  if (event.key === "+" || event.key === "=") {
    event.preventDefault();
    applyZoom(0.1);
  }
  if (event.key === "-") {
    event.preventDefault();
    applyZoom(-0.1);
  }
});

document.querySelectorAll("[data-action]").forEach((button) => {
  button.addEventListener("click", () => {
    const action = button.dataset.action;
    if (action === "reset") resetView();
    if (action === "focus") focusCore();
    if (action === "toggle-minimap") {
      miniMapViewport.classList.toggle("is-hidden");
    }
  });
});

document.querySelectorAll("[data-zoom]").forEach((button) => {
  button.addEventListener("click", () => {
    const delta = button.dataset.zoom === "in" ? 0.1 : -0.1;
    applyZoom(delta);
  });
});

renderTopology();
