"use strict";

document.addEventListener("DOMContentLoaded", () => {
  function openModal(el) {
    if (!el) return;
    el.setAttribute("data-open", "true");
    el.setAttribute("aria-hidden", "false");
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

  const SETTINGS_KEY = "appSettings";
  const USER_RECIPES_KEY = "userRecipes";
  const LEVELS = ["beginner", "intermediate", "advanced"];

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }
  function getCookingLevel() {
    const lvl = (loadSettings().cookingLevel || "beginner").toLowerCase();
    return LEVELS.includes(lvl) ? lvl : "beginner";
  }

  const RECIPES = [
    {
      level: "beginner",
      recipe: "Fried Eggs",
      ingredients: ["egg", "salt", "pepper"],
    },
    {
      level: "beginner",
      recipe: "Butter Toast",
      ingredients: ["bread", "butter"],
    },
    { level: "beginner", recipe: "Cereal", ingredients: ["cereal", "milk"] },
    {
      level: "beginner",
      recipe: "Peanut Butter Sandwich",
      ingredients: ["bread", "peanut butter"],
    },
    {
      level: "intermediate",
      recipe: "French Toast",
      ingredients: ["bread", "egg", "milk", "sugar"],
    },
    {
      level: "intermediate",
      recipe: "Pancakes",
      ingredients: ["flour", "egg", "milk", "baking powder"],
    },
    {
      level: "intermediate",
      recipe: "Garlic Noodles",
      ingredients: ["noodles", "garlic", "butter", "soy sauce"],
    },
    {
      level: "advanced",
      recipe: "Omelette",
      ingredients: ["egg", "cheese", "salt", "pepper"],
    },
    {
      level: "advanced",
      recipe: "Chicken Stir-Fry",
      ingredients: ["chicken", "vegetables", "soy sauce", "garlic"],
    },
    {
      level: "advanced",
      recipe: "Tomato Pasta",
      ingredients: ["pasta", "tomato", "garlic", "olive oil"],
    },
  ];

  const RECIPES_BY_INSTRUCTIONS = {
    "Fried Eggs": [
      "Heat a pan over medium heat.",
      "Add a little oil or butter.",
      "Crack the egg into the pan.",
      "Cook until whites set and yolk is done to your liking.",
      "Season with salt and pepper.",
    ],
    "Butter Toast": [
      "Toast bread to your preferred level.",
      "Spread butter evenly on the toast.",
      "Serve warm.",
    ],
    Cereal: [
      "Pour cereal into a bowl.",
      "Add cold milk.",
      "Enjoy immediately.",
    ],
    "Peanut Butter Sandwich": [
      "Spread peanut butter on one slice of bread.",
      "Top with the second slice.",
      "Cut and serve.",
    ],
    "French Toast": [
      "Whisk egg, milk, and sugar in a bowl.",
      "Dip bread slices in the mixture.",
      "Cook on a buttered pan until golden.",
      "Serve with syrup or fruit.",
    ],
    Pancakes: [
      "Mix flour, baking powder, milk, and egg.",
      "Heat a pan over medium heat and oil lightly.",
      "Pour batter; cook until bubbles form, then flip.",
      "Cook until golden and serve.",
    ],
    "Garlic Noodles": [
      "Boil noodles and drain.",
      "Melt butter, sauté garlic, then toss noodles with soy sauce.",
      "Serve warm.",
    ],
    Omelette: [
      "Beat eggs with salt and pepper.",
      "Pour into a hot, lightly oiled pan.",
      "Add fillings, fold, and serve.",
    ],
    "Chicken Stir-Fry": [
      "Slice chicken and vegetables.",
      "Stir-fry chicken, then add veggies and garlic.",
      "Add soy sauce and serve hot.",
    ],
    "Tomato Pasta": [
      "Cook pasta; save some water.",
      "Sauté garlic, add tomato, and simmer.",
      "Toss pasta with sauce and season.",
    ],
  };

  function loadUserRecipes() {
    try {
      return JSON.parse(localStorage.getItem(USER_RECIPES_KEY)) || [];
    } catch {
      return [];
    }
  }
  function saveUserRecipes(list) {
    localStorage.setItem(USER_RECIPES_KEY, JSON.stringify(list));
  }

  const page = document.querySelector(".recipes--page");
  if (!page) return;
  const header = page.querySelector(".page-header");
  const addBtn = document.getElementById("addRecipeBtn");

  const content =
    page.querySelector(".recipes-content") ||
    (() => {
      const div = document.createElement("div");
      div.className = "inventory-wrap recipes-content";
      div.innerHTML = `
      <div id="recipesCount" class="item-count"></div>
      <ul id="recipesList" class="ingredient-list" aria-live="polite"></ul>
      <div id="recipesEmpty" class="empty-state">No recipes found.</div>
    `;
      page.appendChild(div);
      return div;
    })();

  const recipesList = content.querySelector("#recipesList");
  const recipesCount = content.querySelector("#recipesCount");
  const recipesEmpty = content.querySelector("#recipesEmpty");

  // let showAll = false;

  // let toggleWrap = header.querySelector(".showAllWrap");
  // if (!toggleWrap) {
  //   toggleWrap = document.createElement("div");
  //   toggleWrap.className = "showAllWrap";
  //   header.querySelector(".header-actions")?.appendChild(toggleWrap);
  // }

  // const toggleLabel = document.createElement("label");
  // toggleLabel.className = "row";
  // toggleLabel.style.cursor = "pointer";
  // toggleLabel.style.gap = "0.6rem";
  // const showAllToggle = document.createElement("input");
  // showAllToggle.type = "checkbox";
  // const showAllSpan = document.createElement("span");
  // showAllSpan.textContent = "Show all levels";
  // toggleLabel.append(showAllToggle, showAllSpan);
  // toggleWrap.append(toggleLabel);

  let showAll = false;

  const actions = header.querySelector(".header-actions");
  actions.style.display = "flex";
  actions.style.alignItems = "center";
  actions.style.gap = "1rem";

  const toggleLabel = document.createElement("label");
  toggleLabel.className = "row";
  toggleLabel.style.cursor = "pointer";
  toggleLabel.style.gap = "1rem";

  const showAllToggle = document.createElement("input");
  showAllToggle.type = "checkbox";

  const showAllSpan = document.createElement("span");
  showAllSpan.textContent = "Show all levels";

  toggleLabel.append(showAllToggle, showAllSpan);
  actions.insertBefore(toggleLabel, addBtn);

  const addModal = document.getElementById("addRecipeModal");
  const modalTitle = addModal.querySelector("#addRecipeModalTitle");
  const form = addModal.querySelector("#recipeForm");
  const nameInput = form.querySelector("#recipeNameInput");
  const levelSelect = form.querySelector("#recipeLevelSelect");
  const ingredientsInput = form.querySelector("#recipeIngredientsInput");
  const stepsInput = form.querySelector("#recipeStepsInput");

  nameInput.placeholder = "Enter recipe name";
  ingredientsInput.placeholder = "e.g., egg, salt, pepper";
  stepsInput.placeholder = "1. Step 1\n2. Step 2";

  addModal
    .querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(addModal))
    );
  addModal.addEventListener("click", (e) => {
    if (e.target === addModal) closeModal(addModal);
  });

  const deleteModal = document.getElementById("deleteModal");
  const deletePrompt = deleteModal.querySelector("#deletePrompt");
  const confirmDeleteBtn = deleteModal.querySelector("#confirmDeleteBtn");
  let pendingDelete = null;

  deleteModal
    .querySelectorAll("[data-close-modal]")
    .forEach((btn) =>
      btn.addEventListener("click", () => closeModal(deleteModal))
    );
  deleteModal.addEventListener("click", (e) => {
    if (e.target === deleteModal) closeModal(deleteModal);
  });

  let editTarget = null;

  function openAddModal() {
    editTarget = null;
    modalTitle.textContent = "Add Recipe";
    form.reset();
    levelSelect.value = getCookingLevel();
    openModal(addModal);
  }

  function openEditModal(recipe) {
    editTarget = recipe.recipe;
    modalTitle.textContent = "Edit Recipe";
    nameInput.value = recipe.recipe;
    levelSelect.value = recipe.level;
    ingredientsInput.value = recipe.ingredients.join(", ");
    stepsInput.value = (recipe.steps || []).join("\n");
    openModal(addModal);
  }

  function openDeleteModal(name) {
    deletePrompt.textContent = `Delete "${name}" from your recipes?`;
    pendingDelete = name;
    openModal(deleteModal);
  }

  confirmDeleteBtn.addEventListener("click", () => {
    if (!pendingDelete) return;
    const updated = loadUserRecipes().filter((r) => r.recipe !== pendingDelete);
    saveUserRecipes(updated);
    pendingDelete = null;
    closeModal(deleteModal);
    renderRecipes();
  });

  function openStepsModal(recipe) {
    let modal = document.getElementById("recipeViewModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "recipeViewModal";
      modal.className = "modal-backdrop";
      modal.innerHTML = `
        <div class="modal" role="dialog" aria-modal="true">
          <h2 id="recipeViewTitle"></h2>
          <div id="recipeViewSteps"></div>
          <div class="modal-actions">
            <button type="button" class="btn" data-close-modal>Close</button>
          </div>
        </div>`;
      document.body.appendChild(modal);
      modal
        .querySelectorAll("[data-close-modal]")
        .forEach((btn) =>
          btn.addEventListener("click", () => closeModal(modal))
        );
      modal.addEventListener("click", (e) => {
        if (e.target === modal) closeModal(modal);
      });
    }

    const titleEl = modal.querySelector("#recipeViewTitle");
    const stepsEl = modal.querySelector("#recipeViewSteps");

    titleEl.textContent = recipe.recipe;
    const steps =
      recipe.steps && recipe.steps.length
        ? recipe.steps
        : RECIPES_BY_INSTRUCTIONS[recipe.recipe] || ["No steps available."];
    stepsEl.innerHTML =
      "<ol>" + steps.map((s) => `<li>${s}</li>`).join("") + "</ol>";

    openModal(modal);
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = nameInput.value.trim();
    const level = levelSelect.value;
    const ingredients = ingredientsInput.value
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const steps = stepsInput.value
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);

    if (!name || !ingredients.length || !steps.length) return;

    const userRecipes = loadUserRecipes();
    if (editTarget) {
      const idx = userRecipes.findIndex((r) => r.recipe === editTarget);
      if (idx !== -1)
        userRecipes[idx] = { recipe: name, level, ingredients, steps };
    } else {
      userRecipes.push({ recipe: name, level, ingredients, steps });
    }
    saveUserRecipes(userRecipes);
    closeModal(addModal);
    renderRecipes();
  });

  function renderRecipes() {
    const level = getCookingLevel();
    const include = showAll
      ? LEVELS
      : LEVELS.slice(0, LEVELS.indexOf(level) + 1);
    const userRecipes = loadUserRecipes();
    const all = [...RECIPES, ...userRecipes].filter((r) =>
      include.includes(r.level)
    );

    recipesList.innerHTML = "";
    if (all.length === 0) {
      recipesEmpty.style.display = "block";
      recipesCount.style.display = "none";
      return;
    }

    recipesEmpty.style.display = "none";
    recipesCount.style.display = "block";
    recipesCount.textContent = `${all.length} recipe${
      all.length > 1 ? "s" : ""
    }`;

    const grouped = LEVELS.reduce((a, l) => ((a[l] = []), a), {});
    all.forEach((r) => grouped[r.level].push(r));

    LEVELS.forEach((lvl) => {
      if (!grouped[lvl].length) return;

      const title = document.createElement("li");
      title.className = "item";
      title.style.border = "none";
      title.innerHTML = `<h2 class="item-name">${
        lvl[0].toUpperCase() + lvl.slice(1)
      }</h2>`;
      recipesList.appendChild(title);

      grouped[lvl].forEach((r) => {
        const li = document.createElement("li");
        li.className = "item";
        const head = document.createElement("div");
        head.className = "item-head";
        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = r.recipe;
        head.append(name);

        const meta = document.createElement("div");
        meta.className = "item-meta";
        meta.textContent = `Ingredients: ${r.ingredients.join(", ")}`;

        const actions = document.createElement("div");
        actions.className = "row-actions";

        const openBtn = document.createElement("button");
        openBtn.className = "btn small";
        openBtn.textContent = "Open";
        openBtn.addEventListener("click", () => openStepsModal(r));
        actions.append(openBtn);

        const isUser = userRecipes.some((u) => u.recipe === r.recipe);
        if (isUser) {
          const editBtn = document.createElement("button");
          editBtn.className = "btn small";
          editBtn.textContent = "Edit";
          editBtn.addEventListener("click", () => openEditModal(r));

          const delBtn = document.createElement("button");
          delBtn.className = "btn danger small";
          delBtn.textContent = "Delete";
          delBtn.addEventListener("click", () => openDeleteModal(r.recipe));

          actions.append(editBtn, delBtn);
        }

        li.append(head, actions, meta);
        recipesList.appendChild(li);
      });
    });
  }

  addBtn.addEventListener("click", openAddModal);
  showAllToggle.addEventListener("change", () => {
    showAll = showAllToggle.checked;
    renderRecipes();
  });

  renderRecipes();
});
