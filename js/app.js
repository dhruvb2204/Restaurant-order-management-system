const TAX_RATE = 0.05;
const categories = ["All", "Starters", "Main Course", "Fast Food", "Beverages", "Desserts"];
const orderStatuses = ["Pending", "Preparing", "Ready", "Completed", "Cancelled"];
const orderList = new LinkedList();
const waitingQueue = new Queue();
let menuItems = loadMenu();
let orderCounter = loadOrderCounter();
let cart = [];
let selectedCategory = "All";

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
}
function formatCurrency(value) { return `₹${Number(value).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`; }
function formatDate(value) { return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); }
function getOrders() { return orderList.display(); }
function saveCurrentOrders() { saveOrders(getOrders()); }
function showToast(message, isError = false) {
  const toast = document.createElement("div");
  toast.className = `toast${isError ? " error" : ""}`;
  toast.textContent = message;
  document.querySelector("#toast-container").appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}
function statusBadge(status) { return `<span class="status-badge status-${status.toLowerCase()}">${status}</span>`; }
function getStats() {
  const orders = getOrders();
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "Pending").length,
    preparing: orders.filter((order) => order.status === "Preparing").length,
    ready: orders.filter((order) => order.status === "Ready").length,
    completed: orders.filter((order) => order.status === "Completed").length,
    revenue: orders.filter((order) => order.status === "Completed").reduce((sum, order) => sum + order.total, 0)
  };
}
function renderDashboard() {
  const stats = getStats();
  document.querySelector("#stat-total").textContent = stats.total;
  document.querySelector("#stat-pending").textContent = stats.pending;
  document.querySelector("#stat-preparing").textContent = stats.preparing;
  document.querySelector("#stat-ready").textContent = stats.ready;
  document.querySelector("#stat-completed").textContent = stats.completed;
  document.querySelector("#stat-revenue").textContent = formatCurrency(stats.revenue);
  const recent = [...getOrders()].reverse().slice(0, 6);
  document.querySelector("#recent-orders").innerHTML = recent.length ? `<table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Amount</th><th>Status</th></tr></thead><tbody>${recent.map((order) => `<tr><td><span class="order-id">${order.id}</span></td><td class="customer-cell"><strong>${escapeHtml(order.customer)}</strong><small>${formatDate(order.createdAt)}</small></td><td>${formatCurrency(order.total)}</td><td>${statusBadge(order.status)}</td></tr>`).join("")}</tbody></table>` : '<div class="empty-state">No orders yet. Create your first order to see activity here.</div>';
  const queue = waitingQueue.display();
  document.querySelector("#queue-preview").innerHTML = queue.length ? queue.slice(0, 5).map((order, index) => `<div class="queue-item"><span class="queue-number">${String(index + 1).padStart(2, "0")}</span><div><strong>${escapeHtml(order.customer)}</strong><small>${order.id} · ${order.items.length} item${order.items.length === 1 ? "" : "s"}</small></div><span class="queue-total">${formatCurrency(order.total)}</span></div>`).join("") : '<div class="empty-state">The waiting queue is empty.</div>';
}
function renderCatalog() {
  document.querySelector("#category-filters").innerHTML = categories.map((category) => `<button class="filter-chip ${selectedCategory === category ? "active" : ""}" data-category="${category}">${category}</button>`).join("");
  const visible = menuItems.filter((item) => item.enabled && (selectedCategory === "All" || item.category === selectedCategory));
  document.querySelector("#menu-catalog").innerHTML = visible.length ? visible.map((item) => `<article class="menu-card"><div class="food-image">${escapeHtml(item.icon || "🍽️")}</div><h4>${escapeHtml(item.name)}</h4><p>${escapeHtml(item.category)}</p><div class="menu-card-footer"><strong>${formatCurrency(item.price)}</strong><button class="add-button" data-add-item="${item.id}">＋ Add</button></div></article>`).join("") : '<div class="empty-state">No available items in this category.</div>';
}
function cartTotals() {
  const subtotal = cart.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return { subtotal, tax: subtotal * TAX_RATE, total: subtotal * (1 + TAX_RATE) };
}
function renderCart() {
  const totals = cartTotals();
  document.querySelector("#cart-count").textContent = cart.reduce((sum, line) => sum + line.quantity, 0);
  document.querySelector("#cart-items").innerHTML = cart.length ? cart.map((line) => `<div class="cart-line"><div><strong>${escapeHtml(line.name)}</strong><small>${formatCurrency(line.price)} each</small><div class="quantity-control"><button data-decrease="${line.id}" aria-label="Decrease quantity">−</button><span>${line.quantity}</span><button data-increase="${line.id}" aria-label="Increase quantity">＋</button></div></div><div><strong>${formatCurrency(line.price * line.quantity)}</strong><button class="remove-link" data-remove="${line.id}">Remove</button></div></div>`).join("") : '<div class="empty-state">Your cart is waiting for delicious items.</div>';
  document.querySelector("#cart-subtotal").textContent = formatCurrency(totals.subtotal);
  document.querySelector("#cart-tax").textContent = formatCurrency(totals.tax);
  document.querySelector("#cart-total").textContent = formatCurrency(totals.total);
}
function renderKitchen() {
  const groups = { Pending: [], Preparing: [], Ready: [], Completed: [] };
  getOrders().forEach((order) => { if (groups[order.status]) groups[order.status].push(order); });
  Object.keys(groups).forEach((status) => {
    const target = document.querySelector(`#${status.toLowerCase()}-orders`);
    document.querySelector(`#${status.toLowerCase()}-count`).textContent = groups[status].length;
    target.innerHTML = groups[status].length ? groups[status].map((order) => kitchenCard(order)).join("") : '<div class="empty-state">No orders</div>';
  });
  document.querySelector("#queue-size").textContent = waitingQueue.getSize();
}
function kitchenCard(order) {
  const action = order.status === "Pending" ? `<button class="button button-secondary button-small" data-action="start" data-id="${order.id}">Start preparing</button>` : order.status === "Preparing" ? `<button class="button button-secondary button-small" data-action="ready" data-id="${order.id}">Mark ready</button>` : order.status === "Ready" ? `<button class="button button-primary button-small" data-action="complete" data-id="${order.id}">Complete order</button>` : "";
  const cancel = order.status === "Pending" ? `<button class="button button-danger button-small" data-action="cancel" data-id="${order.id}">Cancel</button>` : "";
  return `<article class="kitchen-card"><h4>${order.id} · ${escapeHtml(order.customer)}</h4><p class="card-meta">${formatDate(order.createdAt)}</p><ul>${order.items.map((item) => `<li>${item.quantity} × ${escapeHtml(item.name)}</li>`).join("")}</ul><div class="kitchen-card-footer"><strong>${formatCurrency(order.total)}</strong><div class="action-group">${cancel}${action}</div></div></article>`;
}
function renderHistory() {
  const query = document.querySelector("#history-search").value.trim().toLowerCase();
  const status = document.querySelector("#history-status").value;
  const filtered = [...getOrders()].reverse().filter((order) => (!query || order.id.toLowerCase().includes(query) || order.customer.toLowerCase().includes(query)) && (status === "all" || order.status === status));
  document.querySelector("#history-table").innerHTML = filtered.length ? `<table class="data-table"><thead><tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${filtered.map((order) => `<tr><td><span class="order-id">${order.id}</span></td><td>${escapeHtml(order.customer)}</td><td>${formatDate(order.createdAt)}</td><td>${formatCurrency(order.total)}</td><td>${statusBadge(order.status)}</td><td><button class="text-link" data-details="${order.id}">View</button></td></tr>`).join("")}</tbody></table>` : '<div class="empty-state">No matching orders found.</div>';
}
function renderMenuManagement() {
  document.querySelector("#management-table").innerHTML = `<table class="data-table"><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Availability</th><th>Actions</th></tr></thead><tbody>${menuItems.map((item) => `<tr><td><strong>${escapeHtml(item.icon || "🍽️")} ${escapeHtml(item.name)}</strong></td><td>${escapeHtml(item.category)}</td><td>${formatCurrency(item.price)}</td><td><span class="management-status"><i class="available-dot ${item.enabled ? "" : "unavailable-dot"}"></i>${item.enabled ? "Available" : "Disabled"}</span></td><td><div class="action-group"><button class="button button-secondary button-small" data-edit-item="${item.id}">Edit</button><button class="button button-danger button-small" data-delete-item="${item.id}">Delete</button></div></td></tr>`).join("")}</tbody></table>`;
}
function refreshViews() { renderDashboard(); renderCatalog(); renderCart(); renderKitchen(); renderHistory(); renderMenuManagement(); }
function setOrderStatus(id, nextStatus) {
  const order = orderList.search(id);
  if (!order) return;
  const allowed = { Pending: ["Preparing", "Cancelled"], Preparing: ["Ready"], Ready: ["Completed"] };
  if (!allowed[order.status]?.includes(nextStatus)) { showToast(`Cannot move ${order.id} from ${order.status} to ${nextStatus}.`, true); return; }
  if (nextStatus === "Preparing") {
    const nextOrder = waitingQueue.peek();
    if (!nextOrder || nextOrder.id !== id) { showToast("Please start the first order in the FIFO queue.", true); return; }
    waitingQueue.dequeue();
  } else if (nextStatus === "Cancelled") {
    const pendingOrders = waitingQueue.display();
    const rebuilt = new Queue();
    pendingOrders.filter((queuedOrder) => queuedOrder.id !== id).forEach((queuedOrder) => rebuilt.enqueue(queuedOrder));
    waitingQueue.front = rebuilt.front; waitingQueue.rear = rebuilt.rear; waitingQueue.size = rebuilt.size;
  }
  orderList.update(id, { status: nextStatus, updatedAt: new Date().toISOString() });
  saveCurrentOrders();
  refreshViews();
  showToast(`${id} marked as ${nextStatus.toLowerCase()}.`);
}
function placeOrder() {
  const customer = document.querySelector("#customer-name").value.trim();
  if (!customer) { showToast("Please enter the customer name.", true); return; }
  if (!cart.length) { showToast("Add at least one menu item before placing the order.", true); return; }
  const totals = cartTotals();
  const order = { id: `OF-${String(orderCounter).padStart(4, "0")}`, customer, items: cart.map((item) => ({ ...item })), subtotal: totals.subtotal, tax: totals.tax, total: totals.total, status: "Pending", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  orderCounter += 1; saveOrderCounter(orderCounter); orderList.insert(order); waitingQueue.enqueue(order); saveCurrentOrders();
  cart = []; document.querySelector("#customer-name").value = ""; refreshViews(); showToast(`${order.id} added to the kitchen queue.`); navigate("kitchen");
}
function showDetails(id) {
  const order = orderList.search(id);
  if (!order) return;
  document.querySelector("#details-title").textContent = `${order.id} · ${order.customer}`;
  document.querySelector("#details-content").innerHTML = `<p class="eyebrow">${statusBadge(order.status)}</p><p class="card-meta">${formatDate(order.createdAt)}</p><div class="cart-items">${order.items.map((item) => `<div class="cart-line"><span>${item.quantity} × ${escapeHtml(item.name)}</span><strong>${formatCurrency(item.price * item.quantity)}</strong></div>`).join("")}</div><div class="bill-summary"><div><span>Subtotal</span><strong>${formatCurrency(order.subtotal)}</strong></div><div><span>Tax</span><strong>${formatCurrency(order.tax)}</strong></div><div class="bill-total"><span>Total</span><strong>${formatCurrency(order.total)}</strong></div></div>`;
  document.querySelector("#details-modal").classList.remove("hidden");
}
function openItemModal(item = null) {
  document.querySelector("#modal-title").textContent = item ? "Edit menu item" : "Add menu item";
  document.querySelector("#menu-item-id").value = item?.id || "";
  document.querySelector("#item-name").value = item?.name || "";
  document.querySelector("#item-category").value = item?.category || "Starters";
  document.querySelector("#item-price").value = item?.price || "";
  document.querySelector("#item-icon").value = item?.icon || "🍽️";
  document.querySelector("#item-enabled").checked = item ? item.enabled : true;
  document.querySelector("#item-modal").classList.remove("hidden");
}
function navigate(view) {
  const valid = ["dashboard", "new-order", "kitchen", "history", "menu-management"];
  if (!valid.includes(view)) view = "dashboard";
  document.querySelectorAll(".view").forEach((element) => element.classList.remove("active-view"));
  document.querySelector(`#${view}-view`).classList.add("active-view");
  document.querySelectorAll(".nav-link").forEach((link) => link.classList.toggle("active", link.dataset.view === view));
  document.querySelector("#page-title").textContent = { dashboard: "Dashboard", "new-order": "New Order", kitchen: "Kitchen", history: "Order History", "menu-management": "Menu Management" }[view];
  if (location.hash !== `#${view}`) history.replaceState(null, "", `#${view}`);
  document.querySelector("#sidebar").classList.remove("open");
}
function initialise() {
  loadOrders().forEach((order) => { orderList.insert(order); if (order.status === "Pending") waitingQueue.enqueue(order); });
  const latestNumber = getOrders().reduce((max, order) => Math.max(max, Number(order.id.replace("OF-", "")) || 0), 0);
  if (latestNumber >= orderCounter) { orderCounter = latestNumber + 1; saveOrderCounter(orderCounter); }
  document.querySelector("#current-date").textContent = new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  refreshViews();
  navigate(location.hash.slice(1) || "dashboard");
}

document.addEventListener("click", (event) => {
  const target = event.target.closest("button, a");
  if (!target) return;
  if (target.dataset.view) { event.preventDefault(); navigate(target.dataset.view); return; }
  if (target.dataset.category) { selectedCategory = target.dataset.category; renderCatalog(); return; }
  if (target.dataset.addItem) { const item = menuItems.find((entry) => entry.id === target.dataset.addItem); const existing = cart.find((line) => line.id === item.id); if (existing) existing.quantity += 1; else cart.push({ ...item, quantity: 1 }); renderCart(); showToast(`${item.name} added to your order.`); return; }
  if (target.dataset.increase || target.dataset.decrease) { const id = target.dataset.increase || target.dataset.decrease; const line = cart.find((item) => item.id === id); if (target.dataset.increase) line.quantity += 1; else if (line.quantity > 1) line.quantity -= 1; else cart = cart.filter((item) => item.id !== id); renderCart(); return; }
  if (target.dataset.remove) { cart = cart.filter((item) => item.id !== target.dataset.remove); renderCart(); return; }
  if (target.dataset.action) { setOrderStatus(target.dataset.id, { start: "Preparing", ready: "Ready", complete: "Completed", cancel: "Cancelled" }[target.dataset.action]); return; }
  if (target.dataset.details) { showDetails(target.dataset.details); return; }
  if (target.id === "add-menu-item") { openItemModal(); return; }
  if (target.dataset.editItem) { openItemModal(menuItems.find((item) => item.id === target.dataset.editItem)); return; }
  if (target.dataset.deleteItem) { const item = menuItems.find((entry) => entry.id === target.dataset.deleteItem); if (confirm(`Delete ${item.name} from the menu?`)) { menuItems = menuItems.filter((entry) => entry.id !== item.id); saveMenu(menuItems); refreshViews(); showToast("Menu item deleted."); } return; }
  if (target.id === "place-order") { placeOrder(); return; }
  if (target.id === "mobile-menu") { document.querySelector("#sidebar").classList.toggle("open"); return; }
  if (target.id === "close-modal" || target.classList.contains("close-details")) { target.closest(".modal-backdrop").classList.add("hidden"); }
});
document.querySelector("#menu-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#item-name").value.trim();
  const price = Number(document.querySelector("#item-price").value);
  if (!name || !Number.isFinite(price) || price <= 0) { showToast("Enter a valid item name and positive price.", true); return; }
  const id = document.querySelector("#menu-item-id").value;
  const item = { id: id || `m-${Date.now()}`, name, category: document.querySelector("#item-category").value, price, icon: document.querySelector("#item-icon").value.trim() || "🍽️", enabled: document.querySelector("#item-enabled").checked };
  if (id) menuItems = menuItems.map((entry) => entry.id === id ? item : entry); else menuItems.push(item);
  saveMenu(menuItems); document.querySelector("#item-modal").classList.add("hidden"); refreshViews(); showToast(id ? "Menu item updated." : "Menu item added.");
});
document.querySelector("#history-search").addEventListener("input", renderHistory);
document.querySelector("#history-status").addEventListener("change", renderHistory);
window.addEventListener("hashchange", () => navigate(location.hash.slice(1)));
initialise();
