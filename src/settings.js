"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const SETTINGS_KEY = "appSettings";

  const settingsForm = document.getElementById("settingsForm");
  const userNameInput = document.getElementById("userNameInput");
  const themeToggle = document.getElementById("themeToggle");
  const resetSettingsBtn = document.getElementById("resetSettings");
  const autoDeleteExpiredToggle = document.getElementById(
    "autoDeleteExpiredToggle"
  );
  const cookingLevelSelect = document.getElementById("cookingLevelSelect");

  const allergyInput = document.getElementById("allergyInput");
  const addAllergyBtn = document.getElementById("addAllergyBtn");
  const allergyChips = document.getElementById("allergyChips");

  const inventoryHeader = document.getElementById("inventoryHeader");
  const containerEl = document.querySelector(".container");

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const defaults = {
        theme: "light",
        userName: "",
        autoDeleteExpired: false,
        cookingLevel: "beginner",
        allergies: [],
      };
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return {
        theme: "light",
        userName: "",
        autoDeleteExpired: false,
        cookingLevel: "beginner",
        allergies: [],
      };
    }
  }
  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  window.renderInventory?.();

  function updateSettings(patch) {
    const curr = loadSettings();
    const next = { ...curr, ...patch };
    saveSettings(next);
    return next;
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    if (containerEl) containerEl.dataset.theme = t;
    document.body.dataset.theme = t;
  }
  function updateInventoryHeader(name) {
    if (!inventoryHeader) return;
    inventoryHeader.textContent = name ? `Hey, ${name}!` : "Refrigerator";
  }
  function applyCookingLevel(level) {
    const normalized = (level || "beginner").toLowerCase();
    document.body.dataset.cookingLevel = normalized;
  }

  let allergies = [];

  const norm = (s) => (s || "").toLowerCase().trim().replace(/\s+/g, " ");

  function persistAllergies() {
    updateSettings({ allergies: [...allergies] });

    window.renderInventory?.();
  }

  function renderAllergyChips() {
    if (!allergyChips) return;
    allergyChips.innerHTML = "";
    if (!allergies.length) return;

    allergies.forEach((a, idx) => {
      const chip = document.createElement("span");
      chip.className = "chip chip--allergy";
      chip.innerHTML = `
        <span>${a}</span>
        <button type="button" class="chip-remove" aria-label="Remove ${a}" data-i="${idx}">×</button>
      `;
      allergyChips.appendChild(chip);
    });

    allergyChips.querySelectorAll(".chip-remove").forEach((btn) => {
      btn.addEventListener("click", () => {
        const i = +btn.dataset.i;
        if (!Number.isInteger(i)) return;
        allergies.splice(i, 1);
        renderAllergyChips();
        persistAllergies();
      });
    });
  }

  function addAllergyFromInput() {
    if (!allergyInput) return;
    const value = norm(allergyInput.value);
    if (!value) return;

    const parts = value
      .split(",")
      .map((p) => norm(p))
      .filter(Boolean);

    let changed = false;
    parts.forEach((p) => {
      if (!allergies.includes(p)) {
        allergies.push(p);
        changed = true;
      }
    });

    if (changed) {
      renderAllergyChips();
      persistAllergies();
    }
    allergyInput.value = "";
  }

  function syncFormFromSettings() {
    const s = loadSettings();
    if (userNameInput) userNameInput.value = s.userName || "";
    if (themeToggle) themeToggle.checked = s.theme === "light";
    if (autoDeleteExpiredToggle)
      autoDeleteExpiredToggle.checked = !!s.autoDeleteExpired;
    if (cookingLevelSelect)
      cookingLevelSelect.value = (s.cookingLevel || "beginner").toLowerCase();

    allergies = Array.isArray(s.allergies) ? [...s.allergies] : [];
    renderAllergyChips();

    applyTheme(s.theme);
    updateInventoryHeader(s.userName);
    applyCookingLevel(s.cookingLevel);
  }

  function pushToast(message = "Saved") {
    const container = document.querySelector(".container");
    if (!container) return;

    let region = container.querySelector("#toastRegion");
    if (!region) {
      region = document.createElement("div");
      region.id = "toastRegion";
      region.className = "toast-region";
      region.setAttribute("role", "region");
      region.setAttribute("aria-live", "polite");
      region.setAttribute("aria-label", "Notifications");
      container.appendChild(region);
    }

    const t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    t.innerHTML = `
      <div class="toast__msg">${message}</div>
      <button class="toast__close" aria-label="Dismiss">&times;</button>
    `;

    const close = () => {
      if (!t.classList.contains("hide")) {
        t.classList.add("hide");
        t.addEventListener("animationend", () => t.remove(), { once: true });
      }
    };
    t.querySelector(".toast__close")?.addEventListener("click", close);
    region.appendChild(t);
    setTimeout(close, 5000);
  }

  if (addAllergyBtn) addAllergyBtn.type = "button";

  addAllergyBtn?.addEventListener("click", addAllergyFromInput);

  allergyInput?.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addAllergyFromInput();
    } else if (e.key === "," && !e.shiftKey) {
      e.preventDefault();
      addAllergyFromInput();
    }
  });

  settingsForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const next = {
      theme: themeToggle?.checked ? "light" : "dark",
      userName: userNameInput?.value.trim() || "",
      autoDeleteExpired: !!autoDeleteExpiredToggle?.checked,
      cookingLevel: (cookingLevelSelect?.value || "beginner").toLowerCase(),
      allergies: [...allergies],
    };
    saveSettings(next);
    applyTheme(next.theme);
    updateInventoryHeader(next.userName);
    applyCookingLevel(next.cookingLevel);

    window.renderInventory?.();
    pushToast("Settings saved");
  });

  themeToggle?.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  resetSettingsBtn?.addEventListener("click", () => {
    const defaults = {
      theme: "light",
      userName: "",
      autoDeleteExpired: false,
      cookingLevel: "beginner",
      allergies: [],
    };
    saveSettings(defaults);
    syncFormFromSettings();

    window.renderInventory?.();
    pushToast("Settings reset to defaults");
  });

  syncFormFromSettings();
});
