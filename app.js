const RATE_VND_TO_PHP = 0.0023; // Replace with a live exchange-rate source in production.
const categories = [
  ["Food", "🍜"], ["Transpo", "🚕"], ["Entertainment", "🎮"], ["Gift", "🎁"],
  ["Load", "📱"], ["Clothes", "👕"], ["Health", "💊"], ["Other", "🐾"]
];

const $ = (id) => document.getElementById(id);
let selectedCategory = "Food";
let viewedMonth = new Date(2026, 10, 1);
let expenses = JSON.parse(localStorage.getItem("catWalletExpenses") || "null") || [
  { id: 1, date: "2026-11-09", category: "Food", note: "Lunch", amount: 85000, time: "12:35 PM" },
  { id: 2, date: "2026-11-09", category: "Transpo", note: "Grab ride", amount: 45000, time: "2:10 PM" },
  { id: 3, date: "2026-11-08", category: "Entertainment", note: "Movie ticket", amount: 120000, time: "6:30 PM" },
  { id: 4, date: "2026-11-08", category: "Food", note: "Dinner", amount: 65000, time: "8:15 PM" },
  { id: 5, date: "2026-11-07", category: "Clothes", note: "Shopping", amount: 250000, time: "3:20 PM" },
  { id: 6, date: "2026-11-07", category: "Transpo", note: "Bus fare", amount: 15000, time: "9:10 AM" }
];

const vnd = n => "₫" + Number(n).toLocaleString("en-US");
const php = n => "₱" + (Number(n) * RATE_VND_TO_PHP).toLocaleString("en-PH", {
  minimumFractionDigits: 2, maximumFractionDigits: 2
});
const monthKey = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
const parseLocalDate = value => new Date(`${value}T12:00:00`);

function renderCategories() {
  $("categoryGrid").innerHTML = categories.map(([name, emoji]) => `
    <button type="button" class="category-option ${name === selectedCategory ? "selected" : ""}" data-category="${name}">
      <span class="emoji">${emoji}</span><span>${name}</span>
    </button>`).join("");
  $("categoryGrid").querySelectorAll("button").forEach(button => {
    button.addEventListener("click", () => {
      selectedCategory = button.dataset.category;
      renderCategories();
    });
  });
}

function render() {
  const key = monthKey(viewedMonth);
  const monthExpenses = expenses.filter(item => item.date.startsWith(key));
  const total = monthExpenses.reduce((sum, item) => sum + Number(item.amount), 0);
  $("monthLabel").textContent = viewedMonth.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  $("totalVnd").textContent = vnd(total);
  $("totalPhp").textContent = php(total);
  $("recordCount").textContent = `${monthExpenses.length} ${monthExpenses.length === 1 ? "record" : "records"}`;
  $("nextMonth").disabled = monthKey(viewedMonth) >= monthKey(new Date(2026, 10, 1));

  const query = $("searchInput").value.trim().toLowerCase();
  const filtered = monthExpenses.filter(item =>
    `${item.note} ${item.category}`.toLowerCase().includes(query)
  );
  const grouped = {};
  filtered.forEach(item => (grouped[item.date] ||= []).push(item));
  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  if (!dates.length) {
    $("expenseList").innerHTML = `<div class="empty-state"><div class="cat">🐱</div><strong>No expenses found!</strong><p style="margin-top:5px">Your kitty wallet is waiting for some records.</p></div>`;
    return;
  }

  $("expenseList").innerHTML = dates.map(date => {
    const day = parseLocalDate(date);
    const rows = grouped[date].sort((a, b) => b.id - a.id).map(item => {
      const emoji = categories.find(c => c[0] === item.category)?.[1] || "🐾";
      return `
        <div class="expense-row">
          <div class="category-icon">${emoji}</div>
          <div class="expense-description">
            <strong>${escapeHtml(item.note)}</strong>
            <div class="expense-meta">${escapeHtml(item.category)} · ${escapeHtml(item.time)}</div>
          </div>
          <div class="expense-amount">
            <strong>${vnd(item.amount)}</strong>
            <span>${php(item.amount)}</span>
          </div>
        </div>`;
    }).join("");
    return `
      <section class="expense-day">
        <div class="day-heading">
          <span class="day-date">${day.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
          <span class="day-weekday">${day.toLocaleDateString("en-US", { weekday: "long" })}</span>
          <span class="day-line"></span>
        </div>
        <div class="day-card">${rows}</div>
      </section>`;
  }).join("");
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function openModal() {
  $("modalBackdrop").classList.remove("hidden");
  $("expenseDate").value = new Date().toISOString().slice(0, 10);
  $("amount").focus();
}
function closeModal() {
  $("modalBackdrop").classList.add("hidden");
  $("expenseForm").reset();
  $("previewPhp").textContent = php(0);
  selectedCategory = "Food";
  renderCategories();
}

$("previousMonth").addEventListener("click", () => {
  viewedMonth = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() - 1, 1);
  render();
});
$("nextMonth").addEventListener("click", () => {
  const candidate = new Date(viewedMonth.getFullYear(), viewedMonth.getMonth() + 1, 1);
  if (candidate <= new Date(2026, 10, 1)) { viewedMonth = candidate; render(); }
});
$("searchToggle").addEventListener("click", () => {
  $("searchWrap").classList.toggle("hidden");
  if (!$("searchWrap").classList.contains("hidden")) $("searchInput").focus();
  else { $("searchInput").value = ""; render(); }
});
$("searchInput").addEventListener("input", render);
$("openModal").addEventListener("click", openModal);
$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);
$("modalBackdrop").addEventListener("click", event => {
  if (event.target === $("modalBackdrop")) closeModal();
});
$("amount").addEventListener("input", () => {
  $("previewPhp").textContent = php(Math.max(0, Number($("amount").value) || 0));
});
$("expenseForm").addEventListener("submit", event => {
  event.preventDefault();
  const amount = Number($("amount").value);
  if (!Number.isFinite(amount) || amount <= 0) return;
  expenses.unshift({
    id: Date.now(),
    date: $("expenseDate").value,
    category: selectedCategory,
    note: $("description").value.trim() || selectedCategory,
    amount,
    time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
  });
  localStorage.setItem("catWalletExpenses", JSON.stringify(expenses));
  viewedMonth = new Date(`${$("expenseDate").value}T12:00:00`);
  closeModal();
  render();
});

renderCategories();
render();
