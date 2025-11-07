import { showToast } from "./utils/utilities.js";

document.addEventListener("DOMContentLoaded", () => {
  const SETTINGS_KEY = "appSettings";

  const settingsForm = document.getElementById("settingsForm");
  const userNameInput = document.getElementById("userNameInput");
  const themeToggle = document.getElementById("themeToggle");
  const resetSettingsBtn = document.getElementById("resetSettings");
  const autoDeleteExpiredToggle = document.getElementById("autoDeleteExpiredToggle");
  const cookingLevelSelect = document.getElementById("cookingLevelSelect");
  const soonDaysInput = document.getElementById("soonDaysInput");

  const inventoryHeader = document.getElementById("inventoryHeader");
  const containerEl = document.querySelector(".container");

  function defaults() {
    return {
      theme: "dark",
      userName: "",
      autoDeleteExpired: false,
      cookingLevel: "beginner",
      soonDays: 2
    };
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem(SETTINGS_KEY);
      return raw ? { ...defaults(), ...JSON.parse(raw) } : defaults();
    } catch {
      return defaults();
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
    if (inventoryHeader)
      inventoryHeader.textContent = name ? `Hey, ${name}!` : "Refrigerator";
  }

  function applyCookingLevel(level) {
    document.body.dataset.cookingLevel = (level || "beginner").toLowerCase();
  }

  function syncFormFromSettings() {
    const s = loadSettings();
    userNameInput.value = s.userName || "";
    themeToggle.checked = s.theme === "light";
    autoDeleteExpiredToggle.checked = !!s.autoDeleteExpired;
    if (cookingLevelSelect)
      cookingLevelSelect.value = (s.cookingLevel || "beginner").toLowerCase();
    if (soonDaysInput)
      soonDaysInput.value = Number.isFinite(+s.soonDays) ? +s.soonDays : 2;
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
      cookingLevel: (cookingLevelSelect?.value || "beginner").toLowerCase(),
      soonDays: Math.max(0, parseInt(soonDaysInput?.value ?? "2", 10) || 2)
    };
    saveSettings(next);
    applyTheme(next.theme);
    updateInventoryHeader(next.userName);
    applyCookingLevel(next.cookingLevel);
    showToast("Settings saved", "success");
    window.dispatchEvent(new Event("settingsUpdated"));
  });

  themeToggle.addEventListener("change", () => {
    applyTheme(themeToggle.checked ? "light" : "dark");
  });

  resetSettingsBtn.addEventListener("click", () => {
    const d = defaults();
    saveSettings(d);
    syncFormFromSettings();
    showToast("Settings reset to defaults", "info");
  });

  syncFormFromSettings();
});
