"use strict";

document.addEventListener("DOMContentLoaded", () => {
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

  const SETTINGS_KEY = "appSettings";
  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const obj = raw ? JSON.parse(raw) : {};
      return obj ?? {};
    } catch {
      return {};
    }
  }
  function getCookingLevel() {
    const level = (loadSettings().cookingLevel || "beginner").toLowerCase();
    return ["beginner", "intermediate", "advanced"].includes(level)
      ? level
      : "beginner";
  }

  const LEVELS = ["beginner", "intermediate", "advanced"];

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
      "Whisk egg, milk, and a bit of sugar in a shallow bowl.",
      "Dip both sides of bread into the mixture.",
      "Cook on a buttered pan over medium heat until golden on both sides.",
      "Serve with syrup or fruit.",
    ],
    Pancakes: [
      "Mix flour, baking powder, milk, and egg into a smooth batter.",
      "Heat a pan over medium heat and lightly oil it.",
      "Pour batter to form pancakes; cook until bubbles form, then flip.",
      "Cook until golden and serve.",
    ],
    "Garlic Noodles": [
      "Boil noodles according to package directions; drain.",
      "Melt butter in a pan; add minced garlic and cook briefly.",
      "Toss noodles with the garlic butter and soy sauce.",
      "Serve warm.",
    ],
    Omelette: [
      "Beat eggs with a pinch of salt and pepper.",
      "Pour into a hot, lightly oiled pan.",
      "When nearly set, add fillings like cheese.",
      "Fold and finish cooking.",
    ],
    "Chicken Stir-Fry": [
      "Slice chicken and vegetables.",
      "Stir-fry chicken in a hot pan with oil until cooked through.",
      "Add vegetables and garlic; stir-fry until tender-crisp.",
      "Finish with soy sauce; toss and serve.",
    ],
    "Tomato Pasta": [
      "Cook pasta until al dente; reserve some pasta water.",
      "Sauté garlic in olive oil; add chopped tomato and simmer.",
      "Toss in pasta with a splash of pasta water.",
      "Season and serve.",
    ],
  };

  const recipesPage = document.querySelector(".recipes--page");
  if (!recipesPage) return;

  const header = recipesPage.querySelector(".page-header");
  let toggleWrap = null;

  let content = recipesPage.querySelector(".recipes-content");
  if (!content) {
    content = document.createElement("div");
    content.className = "inventory-wrap";
    content.innerHTML = `
      <div id="recipesCount" class="item-count"></div>
      <ul id="recipesList" class="ingredient-list" aria-live="polite"></ul>
      <div id="recipesEmpty" class="empty-state">No recipes found.</div>
    `;
    recipesPage.appendChild(content);
  }
  const recipesCount = content.querySelector("#recipesCount");
  const recipesList = content.querySelector("#recipesList");
  const recipesEmpty = content.querySelector("#recipesEmpty");

  let showAllHigher = false;

  function ensureToggle(level) {
    if (toggleWrap) {
      toggleWrap.remove();
      toggleWrap = null;
    }
    if (level === "advanced") return;

    toggleWrap = document.createElement("div");
    toggleWrap.className = "header-actions";
    toggleWrap.style.marginLeft = "auto";

    const label = document.createElement("label");
    label.className = "row";
    label.style.cursor = "pointer";
    label.style.gap = "0.6rem";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.id = "showAllLevelsToggle";
    cb.checked = showAllHigher;

    const span = document.createElement("span");
    span.textContent = "Show all levels";

    cb.addEventListener("change", () => {
      showAllHigher = cb.checked;
      renderRecipes();
    });

    label.append(cb, span);
    toggleWrap.appendChild(label);

    header.appendChild(toggleWrap);
  }

  function levelsToShow(level, showAll) {
    if (level === "advanced") return LEVELS;
    if (level === "intermediate") {
      return showAll ? LEVELS : ["beginner", "intermediate"];
    }
    return showAll ? LEVELS : ["beginner"];
  }

  function renderRecipes() {
    const level = getCookingLevel();
    ensureToggle(level);

    const includeLevels = levelsToShow(level, showAllHigher);

    const toShow = RECIPES.filter((r) => includeLevels.includes(r.level)).sort(
      (a, b) => LEVELS.indexOf(a.level) - LEVELS.indexOf(b.level)
    );

    recipesList.innerHTML = "";

    if (toShow.length === 0) {
      recipesEmpty.style.display = "block";
      recipesCount.style.display = "none";
      return;
    }
    recipesEmpty.style.display = "none";
    recipesCount.style.display = "block";
    recipesCount.textContent =
      toShow.length === 1 ? "1 recipe" : `${toShow.length} recipes`;

    const grouped = LEVELS.reduce((acc, lvl) => {
      acc[lvl] = [];
      return acc;
    }, {});
    toShow.forEach((r) => grouped[r.level].push(r));

    includeLevels.forEach((lvl) => {
      const group = grouped[lvl];
      if (!group || group.length === 0) return;

      const sectionTitle = document.createElement("h2");
      sectionTitle.className = "item-name";
      sectionTitle.style.margin = "0.6rem 0";
      sectionTitle.textContent =
        lvl === "beginner"
          ? "Beginner"
          : lvl === "intermediate"
          ? "Intermediate"
          : "Advanced";
      const titleLi = document.createElement("li");
      titleLi.className = "item";
      titleLi.style.background = "transparent";
      titleLi.style.border = "none";
      titleLi.style.paddingBottom = "0";
      titleLi.appendChild(sectionTitle);
      recipesList.appendChild(titleLi);

      group.forEach((r) => {
        const li = document.createElement("li");
        li.className = "item clickable";
        li.dataset.level = r.level;

        const head = document.createElement("div");
        head.className = "item-head";

        const name = document.createElement("span");
        name.className = "item-name";
        name.textContent = r.recipe;

        head.append(name);

        const actions = document.createElement("div");
        actions.className = "row-actions";
        const openBtn = document.createElement("button");
        openBtn.className = "btn small";
        openBtn.textContent = "Open";
        openBtn.addEventListener("click", (e) => {
          e.stopPropagation();
          openRecipeModal(r.recipe);
        });
        actions.appendChild(openBtn);

        const meta = document.createElement("div");
        meta.className = "item-meta";
        meta.innerHTML = `<span><strong>Ingredients:</strong> ${r.ingredients.join(
          ", "
        )}</span>`;

        li.append(head, actions, meta);

        li.addEventListener("click", () => openRecipeModal(r.recipe));

        recipesList.appendChild(li);
      });
    });
  }

  function ensureRecipeModal() {
    let mb = document.getElementById("recipeModal");
    if (mb) return mb;

    mb = document.createElement("div");
    mb.id = "recipeModal";
    mb.className = "modal-backdrop";
    mb.setAttribute("data-open", "false");
    mb.setAttribute("aria-hidden", "true");
    mb.innerHTML = `
      <div class="modal" role="dialog" aria-labelledby="recipeModalTitle" aria-modal="true">
        <h2 id="recipeModalTitle">Recipe</h2>
        <div id="recipeSteps"></div>
        <div class="modal-actions">
          <button type="button" class="btn" data-close-modal>Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(mb);

    mb.querySelectorAll("[data-close-modal]").forEach((btn) =>
      btn.addEventListener("click", () => closeModal(mb))
    );
    mb.addEventListener("click", (e) => {
      if (e.target === mb) closeModal(mb);
    });

    return mb;
  }

  function openRecipeModal(recipeName) {
    const mb = ensureRecipeModal();
    const title = mb.querySelector("#recipeModalTitle");
    const stepsWrap = mb.querySelector("#recipeSteps");

    title.textContent = recipeName;

    const steps = RECIPES_BY_INSTRUCTIONS[recipeName] || [
      "No steps available.",
    ];

    const ol = document.createElement("ol");
    ol.style.display = "grid";
    ol.style.gap = "0.8rem";
    ol.style.paddingLeft = "2rem";
    ol.style.fontSize = "1.5rem";
    ol.style.lineHeight = "1.6";
    ol.style.color = "var(--ds-ink)";
    ol.style.listStyle = "decimal";
    ol.style.listStylePosition = "outside";

    steps.forEach((s) => {
      const li = document.createElement("li");
      li.textContent = s;
      ol.appendChild(li);
    });

    stepsWrap.innerHTML = "";
    stepsWrap.appendChild(ol);

    openModal(mb);
  }

  const recipesNav = document.querySelector(".navigation .nav-3");
  if (recipesNav) {
    recipesNav.addEventListener("click", () => {
      showAllHigher = false;
      renderRecipes();
    });
  }

  renderRecipes();
});
