"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const shoppingListsView = document.getElementById("shoppingListsView");
  const shoppingItemsView = document.getElementById("shoppingItemsView");
  const shoppingListsEl = document.getElementById("shoppingLists");
  const shoppingListTitle = document.getElementById("shoppingListTitle");
  const shoppingItemsEl = document.getElementById("shoppingItems");
  const addShoppingListBtn = document.getElementById("addShoppingListBtn");
  const backToListsBtn = document.getElementById("backToListsBtn");
  const addShoppingItemBtn = document.getElementById("addShoppingItemBtn");
  const shoppingListsEmpty = document.getElementById("shoppingListsEmpty");
  const shoppingListsCount = document.getElementById("shoppingListsCount");
  const shoppingItemsEmpty = document.getElementById("shoppingItemsEmpty");
  const shoppingItemsCount = document.getElementById("shoppingItemsCount");

  const listModal = document.getElementById("addShoppingListModal");
  const listModalTitle = document.getElementById("addShoppingListTitle");
  const listForm = document.getElementById("addShoppingListForm");
  const listNameInput = document.getElementById("shoppingListNameInput");
  const listSubmitBtn = document.getElementById("shoppingListSubmitBtn");

  const itemModal = document.getElementById("addShoppingItemModal");
  const itemModalTitle = document.getElementById("addShoppingItemTitle");
  const itemForm = document.getElementById("addShoppingItemForm");
  const itemNameInput = document.getElementById("shoppingItemNameInput");
  const itemSubmitBtn = itemForm
    ? itemForm.querySelector("button[type='submit']")
    : null;

  const deleteModal = document.getElementById("deleteModal");
  const deleteTitle = document.getElementById("deleteModalTitle");
  const deletePrompt = document.getElementById("deletePrompt");
  const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

  function openModal(el) {
    if (!el) return;
    el.setAttribute("data-open", "true");
    el.setAttribute("aria-hidden", "false");
    const f = el.querySelector("input, button, [data-close-modal]");
    if (f) setTimeout(() => f.focus(), 0);
    document.addEventListener("keydown", escHandler);
  }
  function closeModal(el) {
    if (!el) return;
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
  [listModal, itemModal, deleteModal].forEach((mb) => {
    if (!mb) return;
    mb.querySelectorAll("[data-close-modal]").forEach((btn) =>
      btn.addEventListener("click", () => closeModal(mb))
    );
    mb.addEventListener("click", (e) => {
      if (e.target === mb) closeModal(mb);
    });
  });

  const SHOP_KEY = "shoppingListsV1";
  function loadShoppingLists() {
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(arr)) return [];
      for (const list of arr) {
        const items = Array.isArray(list.items) ? list.items : [];
        list.items = items.map((it) => {
          const plainName =
            typeof it.name === "string" ? it.name.replace(/\*+$/, "") : it.name;
          const crossedFromName =
            typeof it.name === "string" && /\*+$/.test(it.name);
          return {
            id:
              it.id ||
              (crypto.randomUUID
                ? crypto.randomUUID()
                : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`),
            name: plainName || "",
            crossed:
              typeof it.crossed === "boolean" ? it.crossed : crossedFromName,
            addedAt: it.addedAt || Date.now(),
          };
        });
      }
      return arr;
    } catch {
      return [];
    }
  }
  function saveShoppingLists(arr) {
    localStorage.setItem(SHOP_KEY, JSON.stringify(arr));
  }
  function newId() {
    return crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : `id_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  }
  function getListById(id) {
    return loadShoppingLists().find((l) => l.id === id) || null;
  }

  let currentListId = null;
  let editingItemId = null;

  function renderShoppingLists() {
    const lists = loadShoppingLists();
    shoppingListsEl.innerHTML = "";
    const count = lists.length;
    if (shoppingListsCount) {
      shoppingListsCount.textContent =
        count === 1
          ? "You have 1 shopping list"
          : `You have ${count} shopping lists`;
      shoppingListsCount.style.display = count > 0 ? "block" : "none";
      shoppingListsCount.style.fontSize = "1.8rem";
    }
    if (shoppingListsEmpty)
      shoppingListsEmpty.style.display = count === 0 ? "block" : "none";
    if (count === 0) return;

    lists.sort((a, b) => b.createdAt - a.createdAt);

    for (const list of lists) {
      const li = document.createElement("li");
      li.className = "item clickable";
      li.dataset.id = list.id;

      const head = document.createElement("div");
      head.className = "item-head";

      const name = document.createElement("span");
      name.className = "item-name";
      name.textContent = list.name;

      const badge = document.createElement("span");
      badge.className = "badge";
      const n = list.items?.length || 0;
      badge.textContent = n === 1 ? "1 item" : `${n} items`;

      head.append(name, badge);

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const openBtn = document.createElement("button");
      openBtn.className = "btn small";
      openBtn.textContent = "Open";
      openBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openShoppingList(list.id);
      });

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        requestDeleteList(list.id, list.name);
      });

      actions.append(openBtn, delBtn);

      li.addEventListener("click", () => openShoppingList(list.id));

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.innerHTML = `<span><strong>Created:</strong> ${new Date(
        list.createdAt
      ).toLocaleString()}</span>`;

      li.append(head, actions, meta);
      shoppingListsEl.appendChild(li);
    }
  }

  function renderShoppingItems() {
    const list = getListById(currentListId);
    if (!list) {
      backToLists();
      return;
    }

    shoppingListTitle.textContent = list.name;
    shoppingItemsEl.innerHTML = "";

    const items = Array.isArray(list.items) ? [...list.items] : [];
    const count = items.length;

    if (shoppingItemsCount) {
      shoppingItemsCount.textContent =
        count === 1 ? "This list has 1 item" : `This list has ${count} items`;
      shoppingItemsCount.style.display = count > 0 ? "block" : "none";
    }
    if (shoppingItemsEmpty)
      shoppingItemsEmpty.style.display = count === 0 ? "block" : "none";
    if (count === 0) return;

    items.sort((a, b) => b.addedAt - a.addedAt);

    for (const it of items) {
      const li = document.createElement("li");
      li.className = "item";
      li.dataset.id = it.id;

      const head = document.createElement("div");
      head.className = "item-head";

      const name = document.createElement("span");
      name.className = "item-name";
      name.textContent = it.name;

      if (it.crossed) {
        name.style.textDecoration = "line-through";
        name.style.opacity = "0.6";
        name.style.color = "red";
      }

      head.append(name);

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const crossBtn = document.createElement("button");
      crossBtn.className = "btn small";
      crossBtn.textContent = it.crossed ? "Uncross" : "Cross";
      crossBtn.addEventListener("click", () => toggleCrossItem(it.id));

      const editBtn = document.createElement("button");
      editBtn.className = "btn small";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditItemModal(it));

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => requestDeleteItem(it.id, it.name));

      actions.append(crossBtn, editBtn, delBtn);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.innerHTML = `<span><strong>Added:</strong> ${new Date(
        it.addedAt
      ).toLocaleString()}</span>`;

      li.append(head, actions, meta);
      shoppingItemsEl.appendChild(li);
    }

    const deleteListBtn = document.getElementById("deleteListBtn");
    if (deleteListBtn) {
      deleteListBtn.onclick = () => {
        const l = getListById(currentListId);
        if (!l) return;
        requestDeleteList(l.id, l.name);
      };
    }
  }

  function toggleCrossItem(itemId) {
    const lists = loadShoppingLists();
    const listIdx = lists.findIndex((l) => l.id === currentListId);
    if (listIdx === -1) return;

    const items = lists[listIdx].items || [];
    const idx = items.findIndex((it) => it.id === itemId);
    if (idx === -1) return;

    items[idx].crossed = !items[idx].crossed;
    lists[listIdx].items = items;
    saveShoppingLists(lists);
    renderShoppingItems();
    renderShoppingLists();
  }

  function openEditItemModal(item) {
    editingItemId = item.id;
    if (itemForm) itemForm.reset();
    if (itemNameInput) itemNameInput.value = item.name || "";
    if (itemModalTitle) itemModalTitle.textContent = "Edit Item";
    if (itemSubmitBtn) itemSubmitBtn.textContent = "Save";
    openModal(itemModal);
  }

  function saveEditedItem(newName) {
    const lists = loadShoppingLists();
    const listIdx = lists.findIndex((l) => l.id === currentListId);
    if (listIdx === -1) return;

    const items = lists[listIdx].items || [];
    const idx = items.findIndex((it) => it.id === editingItemId);
    if (idx === -1) return;

    items[idx].name = newName;
    lists[listIdx].items = items;
    saveShoppingLists(lists);
    editingItemId = null;
    renderShoppingItems();
    renderShoppingLists();
  }

  function openShoppingList(listId) {
    currentListId = listId;
    shoppingListsView.style.display = "none";
    shoppingItemsView.style.display = "flex";
    renderShoppingItems();
  }

  function backToLists() {
    currentListId = null;
    shoppingItemsView.style.display = "none";
    shoppingListsView.style.display = "flex";
    renderShoppingLists();
  }

  function createList(name) {
    const lists = loadShoppingLists();
    lists.push({ id: newId(), name, createdAt: Date.now(), items: [] });
    saveShoppingLists(lists);
    renderShoppingLists();
  }

  function deleteList(id) {
    const lists = loadShoppingLists().filter((l) => l.id !== id);
    saveShoppingLists(lists);
    backToLists();
  }

  function addItemToCurrentList(name) {
    const lists = loadShoppingLists();
    const idx = lists.findIndex((l) => l.id === currentListId);
    if (idx === -1) return;
    lists[idx].items = lists[idx].items || [];
    lists[idx].items.push({
      id: newId(),
      name,
      crossed: false,
      addedAt: Date.now(),
    });
    saveShoppingLists(lists);
    renderShoppingItems();
    renderShoppingLists();
  }

  function deleteItemFromCurrentList(itemId) {
    const lists = loadShoppingLists();
    const idx = lists.findIndex((l) => l.id === currentListId);
    if (idx === -1) return;
    lists[idx].items = (lists[idx].items || []).filter(
      (it) => it.id !== itemId
    );
    saveShoppingLists(lists);
    renderShoppingItems();
    renderShoppingLists();
  }

  function requestDeleteList(id, name) {
    if (!deleteModal) return;
    if (deleteTitle) deleteTitle.textContent = "Delete Shopping List";
    if (deletePrompt)
      deletePrompt.textContent = `Delete the list "${name}" and all its items?`;
    const handler = () => {
      deleteList(id);
      closeModal(deleteModal);
    };
    confirmDeleteBtn.addEventListener("click", handler, { once: true });
    openModal(deleteModal);
  }

  function requestDeleteItem(itemId, name) {
    if (!deleteModal) return;
    if (deleteTitle) deleteTitle.textContent = "Remove Item";
    if (deletePrompt)
      deletePrompt.textContent = `Remove "${name}" from this list?`;
    const handler = () => {
      deleteItemFromCurrentList(itemId);
      closeModal(deleteModal);
    };
    confirmDeleteBtn.addEventListener("click", handler, { once: true });
    openModal(deleteModal);
  }

  function openAddListModal() {
    if (!listForm) return;
    listForm.reset();
    if (listModalTitle) listModalTitle.textContent = "New Shopping List";
    if (listSubmitBtn) listSubmitBtn.textContent = "Create";
    openModal(listModal);
  }

  addShoppingListBtn?.addEventListener("click", openAddListModal);
  backToListsBtn?.addEventListener("click", backToLists);
  addShoppingItemBtn?.addEventListener("click", () => {
    if (!currentListId) return;
    editingItemId = null;
    if (itemForm) itemForm.reset();
    if (itemModalTitle) itemModalTitle.textContent = "Add Item";
    if (itemSubmitBtn) itemSubmitBtn.textContent = "Add";
    openModal(itemModal);
  });

  listForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (listNameInput.value || "").trim();
    if (!name) return listNameInput.focus();
    createList(name);
    closeModal(listModal);
  });

  itemForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (itemNameInput.value || "").trim();
    if (!name) return itemNameInput.focus();
    if (editingItemId) {
      saveEditedItem(name);
    } else {
      addItemToCurrentList(name);
    }
    closeModal(itemModal);
    if (itemModalTitle) itemModalTitle.textContent = "Add Item";
    if (itemSubmitBtn) itemSubmitBtn.textContent = "Add";
  });

  renderShoppingLists();
});
