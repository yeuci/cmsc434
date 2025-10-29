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
  const renameListBtn = document.getElementById("renameListBtn");
  const deleteListBtn = document.getElementById("deleteListBtn");

  const listModal = document.getElementById("addShoppingListModal");
  const listModalTitle = document.getElementById("addShoppingListTitle");
  const listForm = document.getElementById("addShoppingListForm");
  const listNameInput = document.getElementById("shoppingListNameInput");
  const listSubmitBtn = document.getElementById("shoppingListSubmitBtn");

  const itemModal = document.getElementById("addShoppingItemModal");
  const itemForm = document.getElementById("addShoppingItemForm");
  const itemNameInput = document.getElementById("shoppingItemNameInput");

  const deleteModal = document.getElementById("deleteModal");
  const deleteTitle = document.getElementById("deleteModalTitle");
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
  listModal
    ?.querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(listModal))
    );
  itemModal
    ?.querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(itemModal))
    );
  deleteModal
    ?.querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(deleteModal))
    );
  [listModal, itemModal, deleteModal].forEach((mb) => {
    if (!mb) return;
    mb.addEventListener("click", (e) => {
      if (e.target === mb) closeModal(mb);
    });
  });

  const SHOP_KEY = "shoppingListsV1";
  function loadShoppingLists() {
    try {
      const raw = localStorage.getItem(SHOP_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
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
    }
    if (shoppingListsEmpty) {
      shoppingListsEmpty.style.display = count === 0 ? "block" : "none";
    }
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

      const renameBtn = document.createElement("button");
      renameBtn.className = "btn small";
      renameBtn.textContent = "Rename";
      renameBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        openRenameListModal(list.id);
      });

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        requestDeleteList(list.id, list.name);
      });

      actions.append(openBtn, renameBtn, delBtn);

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
    if (shoppingItemsEmpty) {
      shoppingItemsEmpty.style.display = count === 0 ? "block" : "none";
    }
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

      head.append(name);

      const actions = document.createElement("div");
      actions.className = "row-actions";

      const delBtn = document.createElement("button");
      delBtn.className = "btn danger small";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => requestDeleteItem(it.id, it.name));

      actions.append(delBtn);

      const meta = document.createElement("div");
      meta.className = "item-meta";
      meta.innerHTML = `<span><strong>Added:</strong> ${new Date(
        it.addedAt
      ).toLocaleString()}</span>`;

      li.append(head, actions, meta);
      shoppingItemsEl.appendChild(li);
    }
  }

  function openShoppingList(listId) {
    currentListId = listId;
    shoppingListsView.style.display = "none";
    shoppingItemsView.style.display = "block";
    renderShoppingItems();
  }
  function backToLists() {
    currentListId = null;
    shoppingItemsView.style.display = "none";
    shoppingListsView.style.display = "block";
    renderShoppingLists();
  }

  function createList(name) {
    const lists = loadShoppingLists();
    lists.push({ id: newId(), name, createdAt: Date.now(), items: [] });
    saveShoppingLists(lists);
    renderShoppingLists();
  }
  function renameList(id, newName) {
    const lists = loadShoppingLists();
    const idx = lists.findIndex((l) => l.id === id);
    if (idx === -1) return;
    lists[idx].name = newName;
    saveShoppingLists(lists);
    renderShoppingLists();
    if (currentListId === id) renderShoppingItems();
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
    lists[idx].items.push({ id: newId(), name, addedAt: Date.now() });
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
    deleteTitle.textContent = "Delete Shopping List";
    deletePrompt.textContent = `Delete the list "${name}" and all its items?`;
    const handler = () => {
      deleteList(id);
      closeModal(deleteModal);
    };
    confirmDeleteBtn.addEventListener("click", handler, { once: true });
    openModal(deleteModal);
  }
  function requestDeleteItem(itemId, name) {
    deleteTitle.textContent = "Remove Item";
    deletePrompt.textContent = `Remove "${name}" from this list?`;
    const handler = () => {
      deleteItemFromCurrentList(itemId);
      closeModal(deleteModal);
    };
    confirmDeleteBtn.addEventListener("click", handler, { once: true });
    openModal(deleteModal);
  }

  let listModalCtx = { mode: "create", targetListId: null };
  function openAddListModal() {
    listModalCtx = { mode: "create", targetListId: null };
    listForm.reset();
    listModalTitle.textContent = "New Shopping List";
    listSubmitBtn.textContent = "Create";
    listNameInput.value = "";
    openModal(listModal);
  }
  function openRenameListModal(listId) {
    const list = getListById(listId);
    if (!list) return;
    listModalCtx = { mode: "rename", targetListId: listId };
    listModalTitle.textContent = "Rename Shopping List";
    listSubmitBtn.textContent = "Save";
    listNameInput.value = list.name;
    openModal(listModal);
  }

  addShoppingListBtn?.addEventListener("click", openAddListModal);
  backToListsBtn?.addEventListener("click", backToLists);
  addShoppingItemBtn?.addEventListener("click", () => {
    if (!currentListId) return;
    itemForm.reset();
    openModal(itemModal);
  });
  renameListBtn?.addEventListener("click", () => {
    if (!currentListId) return;
    openRenameListModal(currentListId);
  });
  deleteListBtn?.addEventListener("click", () => {
    if (!currentListId) return;
    const l = getListById(currentListId);
    if (!l) return;
    requestDeleteList(currentListId, l.name);
  });

  listForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (listNameInput.value || "").trim();
    if (!name) {
      listNameInput.focus();
      return;
    }
    if (listModalCtx.mode === "create") {
      createList(name);
      closeModal(listModal);
    } else if (listModalCtx.mode === "rename" && listModalCtx.targetListId) {
      renameList(listModalCtx.targetListId, name);
      closeModal(listModal);
    }
  });

  itemForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = (itemNameInput.value || "").trim();
    if (!name) {
      itemNameInput.focus();
      return;
    }
    addItemToCurrentList(name);
    closeModal(itemModal);
  });

  renderShoppingLists();
});
