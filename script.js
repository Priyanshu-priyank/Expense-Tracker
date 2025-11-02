const tabs = Array.from(document.querySelectorAll(".tab"));
const pages = Array.from(document.querySelectorAll(".page"));
const tabsTrack = document.querySelector(".tabs-track");

function showPage(name) {
  pages.forEach((p) => p.classList.toggle("active", p.id === name));
  tabs.forEach((t) => t.classList.toggle("active", t.dataset.target === name));
  const active = tabs.find((t) => t.dataset.target === name);
  if (active) positionTrack(active);
}

function positionTrack(btn) {
  const parentRect = btn.parentElement.getBoundingClientRect();
  const rect = btn.getBoundingClientRect();
  tabsTrack.style.width = `${rect.width}px`;
  tabsTrack.style.transform = `translateX(${rect.left - parentRect.left}px)`;
}

tabs.forEach((t) =>
  t.addEventListener("click", () => showPage(t.dataset.target))
);

document.addEventListener("DOMContentLoaded", () => {
  const initial = document.querySelector(".tab.active") || tabs[0];
  showPage(initial.dataset.target);
  //delay to ensure layout measured
  setTimeout(() => positionTrack(document.querySelector(".tab.active")), 80);
});

window.addEventListener("resize", () => {
  const active = document.querySelector(".tab.active");
  if (active) positionTrack(active);
});

let expenses = JSON.parse(localStorage.getItem("expenses_v1")) || [
  {
    id: genId(),
    title: "Grocery shopping",
    category: "Food",
    date: "2025-10-25",
    amount: 125.5,
  },
  {
    id: genId(),
    title: "Gas station",
    category: "Transport",
    date: "2025-10-26",
    amount: 55.0,
  },
  {
    id: genId(),
    title: "Netflix",
    category: "Shopping",
    date: "2025-10-27",
    amount: 15.99,
  },
];

function genId() {
  return Math.random().toString(36).slice(2, 9);
}
function save() {
  localStorage.setItem("expenses_v1", JSON.stringify(expenses));
}

//expense list
const expenseListEl = document.getElementById("expenseList");
const searchEl = document.getElementById("search");
const catFilterEl = document.getElementById("catFilter");

function renderExpenses(filter = "") {
  const q = (filter || "").trim().toLowerCase();
  const items = expenses
    .filter((e) => {
      if (!q) return true;
      return (
        e.title.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  expenseListEl.innerHTML = items
    .map(
      (e) => `
    <div class="expense-item" data-id="${e.id}">
      <div class="expense-left">
        <div class="cat-pill">${escapeHtml(e.category)}</div>
        <div>
          <div class="expense-title">${escapeHtml(e.title)}</div>
          <div class="expense-meta">${new Date(
            e.date
          ).toLocaleDateString()}</div>
        </div>
      </div>

      <div class="expense-right">
        <div class="expense-amt">₹${Number(e.amount).toFixed(2)}</div>
        <button class="icon-btn edit" title="Edit" data-id="${e.id}">✎</button>
        <button class="icon-btn del" title="Delete" data-id="${
          e.id
        }">🗑️</button>
      </div>
    </div>
  `
    )
    .join("");

  expenseListEl
    .querySelectorAll(".edit")
    .forEach((btn) => btn.addEventListener("click", onEdit));
  expenseListEl
    .querySelectorAll(".del")
    .forEach((btn) => btn.addEventListener("click", onDelete));
}

// Edit or delete
function onEdit(e) {
  const id = e.currentTarget.dataset.id;
  const item = expenses.find((x) => x.id === id);
  if (!item) return;

  const newTitle = prompt("Edit description", item.title);
  if (newTitle === null) return;
  const newAmt = prompt("Edit amount", item.amount);
  if (newAmt === null) return;
  const newCat = prompt("Edit category", item.category);
  if (newCat === null) return;
  const newDate = prompt("Edit date (YYYY-MM-DD)", item.date);
  if (newDate === null) return;

  item.title = newTitle;
  item.amount = parseFloat(newAmt) || item.amount;
  item.category = newCat;
  item.date = newDate || item.date;
  save();
  renderExpenses(searchEl.value || catFilterEl.value);
  updateOverview();
}

function onDelete(e) {
  const id = e.currentTarget.dataset.id;
  if (!confirm("Delete this expense?")) return;
  expenses = expenses.filter((x) => x.id !== id);
  save();
  renderExpenses(searchEl.value || catFilterEl.value);
  updateOverview();
}

// search
searchEl.addEventListener("input", (ev) => renderExpenses(ev.target.value));
catFilterEl.addEventListener("change", (ev) => renderExpenses(ev.target.value));

const addForm = document.getElementById("addForm");
addForm.addEventListener("submit", (ev) => {
  ev.preventDefault();
  const title = document.getElementById("desc").value.trim();
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const date =
    document.getElementById("date").value ||
    new Date().toISOString().slice(0, 10);
  if (!title || !amount)
    return alert("Please enter valid description and amount");

  expenses.push({ id: genId(), title, amount, category, date });
  save();
  addForm.reset();
  showPage("expenses");
  renderExpenses();
  updateOverview();
});

const pieCtx = document.getElementById("pieChart").getContext("2d");
const barCtx = document.getElementById("barChart").getContext("2d");
const hbarCtx = document.getElementById("hBarChart").getContext("2d");

const pie = new Chart(pieCtx, {
  type: "doughnut",
  data: {
    labels: [],
    datasets: [
      {
        data: [],
        backgroundColor: [
          "#5b7cff",
          "#8a5cf6",
          "#ff6fa8",
          "#f5a623",
          "#50e3c2",
        ],
      },
    ],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "bottom" } },
  },
});

const bar = new Chart(barCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [{ label: "Amount", data: [], backgroundColor: "#5b7cff" }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  },
});

const hbar = new Chart(hbarCtx, {
  type: "bar",
  data: {
    labels: [],
    datasets: [
      {
        label: "Amount",
        data: [],
        backgroundColor: [
          "#5b7cff",
          "#8a5cf6",
          "#ff6fa8",
          "#f5a623",
          "#50e3c2",
        ],
      },
    ],
  },
  options: {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { beginAtZero: true } },
  },
});

//update overview & chart
function updateOverview() {
  const total = expenses.reduce((s, e) => s + Number(e.amount), 0);
  document.getElementById("totalExpenses").textContent = `₹${total.toFixed(2)}`;
  document.getElementById("transactionsCount").textContent =
    expenses.length || 0;

  const now = new Date();
  const thisMonthTotal = expenses
    .filter(
      (e) =>
        new Date(e.date).getMonth() === now.getMonth() &&
        new Date(e.date).getFullYear() === now.getFullYear()
    )
    .reduce((s, e) => s + Number(e.amount), 0);
  document.getElementById("thisMonth").textContent = `₹${thisMonthTotal.toFixed(
    2
  )}`;

  //categories totals
  const cats = ["Food", "Transport", "Shopping", "Bills", "Other"];
  const catTotals = cats.map((c) =>
    expenses
      .filter((e) => e.category === c)
      .reduce((s, x) => s + Number(x.amount), 0)
  );
  const any = catTotals.some((v) => v > 0);
  pie.data.labels = cats;
  pie.data.datasets[0].data = any ? catTotals : [1, 1, 1, 1, 1];
  pie.update();

  // bar chart
  const buckets = 6;
  const labels = [];
  const dataLast = [];
  const nowMs = Date.now();
  for (let i = buckets - 1; i >= 0; i--) {
    const start = new Date(nowMs - (i + 1) * (30 / buckets) * 24 * 3600 * 1000);
    labels.push(`${start.getMonth() + 1}/${start.getDate()}`);
    const end = new Date(nowMs - i * (30 / buckets) * 24 * 3600 * 1000);
    const sum = expenses
      .filter((e) => new Date(e.date) >= start && new Date(e.date) < end)
      .reduce((s, x) => s + Number(x.amount), 0);
    dataLast.push(sum);
  }
  bar.data.labels = labels;
  bar.data.datasets[0].data = dataLast;
  bar.update();

  // horizontal bar
  hbar.data.labels = cats;
  hbar.data.datasets[0].data = catTotals;
  hbar.update();

  // categories count
  const categoriesCount = cats.filter((c, i) => catTotals[i] > 0).length;
  document.getElementById("categoriesCount").textContent = categoriesCount;
}

function escapeHtml(s) {
  return String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[
        c
      ])
  );
}

function renderAll() {
  renderExpenses();
  updateOverview();
}

renderAll();
