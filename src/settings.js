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
  const cookingLevelSelect = document.getElementById("cookingLevelSelect"); // NEW

  const inventoryHeader = document.getElementById("inventoryHeader");
  const containerEl = document.querySelector(".container");

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      const defaults = {
        theme: "dark",
        userName: "",
        autoDeleteExpired: false,
        cookingLevel: "beginner",
      };
      return raw ? { ...defaults, ...JSON.parse(raw) } : defaults;
    } catch {
      return {
        theme: "dark",
        userName: "",
        autoDeleteExpired: false,
        cookingLevel: "beginner",
      };
    }
  }

  function saveSettings(s) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
  }

  function applyTheme(theme) {
    const t = theme === "light" ? "light" : "dark";
    containerEl.dataset.theme = t;
    document.body.dataset.theme = t;
  }

  function updateInventoryHeader(name) {
    if (!inventoryHeader) return;
    inventoryHeader.textContent = name ? `Hey, ${name}!` : "Kitchen Inventory";
  }

  function applyCookingLevel(level) {
    const normalized = (level || "beginner").toLowerCase();
    document.body.dataset.cookingLevel = normalized;
  }

  function syncFormFromSettings() {
    const s = loadSettings();
    userNameInput.value = s.userName || "";
    themeToggle.checked = s.theme === "light";
    autoDeleteExpiredToggle.checked = !!s.autoDeleteExpired;
    if (cookingLevelSelect)
      cookingLevelSelect.value = (s.cookingLevel || "beginner").toLowerCase();

    applyTheme(s.theme);
    updateInventoryHeader(s.userName);
    applyCookingLevel(s.cookingLevel);
  }

  settingsForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const next = {
      theme: themeToggle.checked ? "light" : "dark",
      userName: userNameInput.value.trim(),
      autoDeleteExpired: !!autoDeleteExpiredToggle.checked,
      cookingLevel: (cookingLevelSelect?.value || "beginner").toLowerCase(), // NEW
    };
    saveSettings(next);
    applyTheme(next.theme);
    updateInventoryHeader(next.userName);
    applyCookingLevel(next.cookingLevel);
  });

  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  resetSettingsBtn.addEventListener("click", () => {
    const defaults = {
      theme: "dark",
      userName: "",
      autoDeleteExpired: false,
      cookingLevel: "beginner",
    }; // NEW default
    saveSettings(defaults);
    syncFormFromSettings();
  });

  syncFormFromSettings();
});
