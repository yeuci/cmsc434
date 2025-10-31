"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const inventoryHeader = document.getElementById("inventoryHeader");
  const listEl = document.getElementById("ingredientList");
  const emptyStateEl = document.getElementById("emptyState");
  const sortSelect = document.getElementById("sortSelect");
  const itemCountEl = document.getElementById("itemCount");

  const addModal = document.getElementById("addModal");
  const addModalTitle = document.getElementById("addModalTitle");
  const addForm = document.getElementById("addIngredientForm");
  const ingNameInput = document.getElementById("ingName");
  const ingExpiryInput = document.getElementById("ingExpiry");
  const ingQtyInput = document.getElementById("ingQty"); // NEW
  const openAddModalBtn = document.getElementById("openAddModalBtn");
  const addSubmitBtn = addForm.querySelector("button[type='submit']");

  const deleteModal = document.getElementById("deleteModal");
  const deletePrompt = document.getElementById("deletePrompt");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  function openModal(el) {
    el.setAttribute("data-open", "true");
    el.setAttribute("aria-hidden", "false");
    const f = el.querySelector("input, button, [data-close-modal]");
    if (f) setTimeout(() => f.focus(), 0);
    document.addEventListener("keydown", escHandler);
  }
  function closeModal(el) {
    el.setAttribute("data-open", "false");
    el.setAttribute("aria-hidden", "true");
    document.removeEventListener("keydown", escHandler);
  }
  function escHandler(e) {
    if (e.key === "Escape") {
      document
        .querySelectorAll(".modal-backdrop[data-open='true']")
        .forEach(closeModal);
    }
  }
  addModal
    .querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(addModal))
    );
  deleteModal
    .querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(deleteModal))
    );
  [addModal, deleteModal].forEach((mb) =>
    mb.addEventListener("click", (e) => {
      if (e.target === mb) closeModal(mb);
    })
  );

  const SETTINGS_KEY = "appSettings";
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw
        ? {
            theme: "dark",
            userName: "",
            autoDeleteExpired: false,
            ...JSON.parse(raw),
          }
        : { theme: "dark", userName: "", autoDeleteExpired: false };
    } catch {
      return { theme: "dark", userName: "", autoDeleteExpired: false };
    }
  }
  function applyTheme(theme) {
    const containerEl = document.querySelector(".container");
    const t = theme === "light" ? "light" : "dark";
    containerEl.dataset.theme = t;
    document.body.dataset.theme = t;
  }
  function updateInventoryHeader(name) {
    if (!inventoryHeader) return;
    inventoryHeader.textContent = name ? `Hey, ${name}!` : "Refrigerator";
  }

  const STORAGE_KEY = "kitchenIngredients";
  const SORT_KEY = "ingredientSortBy";

  function loadItems() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : []) : [];
      // NEW: normalize qty for older items
      return arr.map(it => ({ ...it, qty: Number.isFinite(+it?.qty) && +it.qty > 0 ? +it.qty : 1 }));
    } catch {
      return [];
    }
  }
  function saveItems(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }
  function loadSortBy() {
    return localStorage.getItem(SORT_KEY) || "expiry";
  }
  function saveSortBy(v) {
    localStorage.setItem(SORT_KEY, v);
  }

  function fmtDateISOToLocal(iso) {
    if (!iso) return "—";
    const d = new Date(iso + "T00:00:00");
    if (Number.isNaN(+d)) return "—";
    return d.toLocaleDateString();
  }
  function fmtTimestamp(ms) {
    const d = new Date(ms);
    return d.toLocaleString();
  }
  function daysUntil(isoDate) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const d = new Date(isoDate + "T00:00:00");
    if (Number.isNaN(+d)) return null;
    const diffMs = d - today;
    return Math.round(diffMs / 86400000);
  }
  function statusDotClass(isoDate) {
    const days = daysUntil(isoDate);
    if (days === null) return "dot-fresh";
    if (days < 0) return "dot-expired";
    if (days <= 2) return "dot-soon";
    return "dot-fresh";
  }
  function purgeExpiredItemsIfEnabled() {
    const s = loadSettings();
    if (!s.autoDeleteExpired) return;
    const items = loadItems();
    if (!items.length) return;
    const keep = items.filter((it) => {
      const du = daysUntil(it.expiry);
      return du === null || du >= 0;
    });
    if (keep.length !== items.length) saveItems(keep);
  }

  function render() {
    purgeExpiredItemsIfEnabled();

    const settings = loadSettings();
    applyTheme(settings.theme);
    updateInventoryHeader(settings.userName);

    const items = loadItems();
    const sortBy = loadSortBy();

    const count = items.length;
    const countText =
      count === 1
        ? "Refridergator has 1 item"
        : `Refridergator has ${count} items`;
    if (itemCountEl) {
      itemCountEl.textContent = countText;
      itemCountEl.style.display = count > 0 ? "block" : "none";
      itemCountEl.style.fontSize = "1.8rem";
    }

    items.sort((a, b) => {
      if (sortBy === "expiry") {
        const da = new Date(a.expiry || "9999-12-31");
        const db = new Date(b.expiry || "9999-12-31");
        if (+da !== +db) return +da - +db;
        return b.addedAt - a.addedAt;
      } else if (sortBy === "added") {
        return b.addedAt - a.addedAt;
      } else if (sortBy === "name") {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    listEl.innerHTML = "";
    if (items.length === 0) {
      emptyStateEl.style.display = "block";
      return;
    }
    emptyStateEl.style.display = "none";

    for (const it of items) {
      const li = document.createElement("li");
      li.className = "item";
      li.dataset.id = it.id;

      const head = document.createElement("div");
      head.className = "item-head";

      const name = document.createElement("span");
      name.className = "item-name";
      name.textContent = it.name;

      const badge = document.createElement("span");
      badge.className = "badge";
      const du = daysUntil(it.expiry);
      if (du === null) badge.textContent = "No expiry";
      else if (du < 0) badge.textContent = `Expired ${Math.abs(du)}d`;
      else if (du === 0) badge.textContent = "Expires today";
      else if (du === 1) badge.textContent = "Expires in 1 day";
      else badge.textContent = `Expires in ${du} days`;

      head.append(name, badge);

      const actions = document.createElement("div");
      actions.className = "item-actions";

      const editBtn = document.createElement("button");
      editBtn.className = "btn";
      editBtn.setAttribute("data-action", "edit");
      editBtn.textContent = "Edit";
      actions.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger";
      delBtn.setAttribute("data-action", "delete");
      delBtn.textContent = "Delete";
      actions.appendChild(delBtn);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.innerHTML = `
        <span><strong>Qty:</strong> ${Number.isFinite(+it.qty) && +it.qty > 0 ? +it.qty : 1}</span>
        <span><strong>Expiry:</strong> ${fmtDateISOToLocal(it.expiry)}</span>
        <span><strong>Added:</strong> ${fmtTimestamp(it.addedAt)}</span>
        <span class="dot ${statusDotClass(it.expiry)}" title="status"></span>
      `;

      li.append(head, actions, meta);
      listEl.appendChild(li);
    }
  }

  let itemModalCtx = { mode: "create", targetId: null };

  openAddModalBtn.addEventListener("click", () => {
    itemModalCtx = { mode: "create", targetId: null };
    addModalTitle.textContent = "Add Ingredient";
    addSubmitBtn.textContent = "Add";
    addForm.reset();
    ingQtyInput.value = "1"; // NEW default
    ingExpiryInput.value = new Date().toISOString().slice(0, 10);
    openModal(addModal);
  });

  function openEditItemModal(itemId) {
    const items = loadItems();
    const it = items.find((x) => x.id === itemId);
    if (!it) return;

    itemModalCtx = { mode: "edit", targetId: itemId };
    addModalTitle.textContent = "Edit Ingredient";
    addSubmitBtn.textContent = "Save";
    ingNameInput.value = it.name || "";
    ingQtyInput.value = (Number.isFinite(+it.qty) && +it.qty > 0 ? +it.qty : 1).toString(); // NEW
    ingExpiryInput.value = it.expiry || "";
    openModal(addModal);
  }

  addForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let name = ingNameInput.value.trim();
    const expiry = ingExpiryInput.value;
    let qty = parseInt(ingQtyInput.value, 10);
    if (!Number.isFinite(qty) || qty < 1) qty = 1; // sanitize

    if (!name) {
      ingNameInput.focus();
      return;
    }

    if (name.length > 17) {
      name = name.slice(0, 15) + "...";
    }

    const items = loadItems();

    if (itemModalCtx.mode === "edit" && itemModalCtx.targetId) {
      const idx = items.findIndex((x) => x.id === itemModalCtx.targetId);
      if (idx !== -1) {
        items[idx] = { ...items[idx], name, expiry, qty, updatedAt: Date.now() }; // NEW qty
        saveItems(items);
      }
      itemModalCtx = { mode: "create", targetId: null };
      closeModal(addModal);
      render();
      return;
    }

    items.push({
      id:
        crypto && crypto.randomUUID
          ? crypto.randomUUID()
          : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`,
      name,
      qty,          // NEW
      expiry,
      addedAt: Date.now(),
    });
    saveItems(items);
    itemModalCtx = { mode: "create", targetId: null };
    closeModal(addModal);
    render();
  });

  let pendingDeleteId = null;
  listEl.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const li = btn.closest(".item");
    if (!li) return;
    const id = li.dataset.id;
    const action = btn.getAttribute("data-action");

    if (action === "edit") {
      openEditItemModal(id);
      return;
    }

    if (action === "delete") {
      pendingDeleteId = id;
      const items = loadItems();
      const target = items.find((x) => x.id === pendingDeleteId);
      deletePrompt.textContent = target
        ? `Remove "${target.name}" from your fridge?`
        : "Remove this item from your fridge?";

      const handler = () => {
        if (!pendingDeleteId) return;
        const next = loadItems().filter((x) => x.id !== pendingDeleteId);
        saveItems(next);
        pendingDeleteId = null;
        closeModal(deleteModal);
        render();
      };
      confirmDeleteBtn.addEventListener("click", handler, { once: true });

      openModal(deleteModal);
    }
  });

  if (sortSelect) {
    sortSelect.value = loadSortBy();
    sortSelect.addEventListener("change", () => {
      saveSortBy(sortSelect.value);
      render();
    });
  }

  render();
});
