// js/settings.js
// Generic settings manager:
// - Reads all <input>, <select>, <textarea> that have an id
// - Restores their values from localStorage on load
// - Saves automatically on change / toggle
// - Optional: manual "Save" button with [data-settings-save]

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "healthsight-settings-v1";

  /* ---------------------------
     Helpers: storage
  --------------------------- */

  function loadSettings() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (e) {
      console.warn("Failed to load settings from localStorage", e);
      return {};
    }
  }

  function saveSettings(settings) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch (e) {
      console.warn("Failed to save settings to localStorage", e);
    }
  }

  let settings = loadSettings();

  /* ---------------------------
     Find all fields in Settings
     (any input/select/textarea) and assign a stable key
  --------------------------- */

  function normalizeKey(str) {
    return String(str || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function getKey(el, idx) {
    if (el.dataset.settingKey) return el.dataset.settingKey;
    if (el.id) return el.id;
    if (el.name) return normalizeKey(el.name);
    if (el.placeholder) return normalizeKey(el.placeholder).slice(0, 40) || `field-${idx}`;
    return `field-${idx}`;
  }

  const fields = Array.from(document.querySelectorAll("input, select, textarea"));

  fields.forEach((el, idx) => {
    const key = getKey(el, idx);
    el.dataset.settingKey = key;
    // If the element lacks an id, assign one for accessibility and labels
    if (!el.id) {
      el.id = `setting-${key}-${idx}`;
    }
  });

  if (fields.length === 0) {
    console.warn("[Settings] No inputs found. settings.js has nothing to bind.");
  }

  /* ---------------------------
     Apply saved values on load
  --------------------------- */

  function applyInitialValues() {
    fields.forEach((el) => {
      const key = el.dataset.settingKey;
      if (!key) return;

      if (!(key in settings)) {
        // no saved value; keep whatever default is in HTML
        return;
      }

      const saved = settings[key];

      if (el.type === "checkbox" || el.type === "radio") {
        el.checked = !!saved;
      } else if (el.tagName === "SELECT") {
        el.value = saved;
      } else {
        el.value = saved;
      }
    });
  }

  /* ---------------------------
     Update settings from an element
  --------------------------- */

  function updateSettingsFromElement(el, { silent = false } = {}) {
    const key = el.dataset.settingKey;
    if (!key) return;

    let value;

    if (el.type === "checkbox" || el.type === "radio") {
      value = el.checked;
    } else {
      value = el.value;
    }

    settings[key] = value;
    saveSettings(settings);

    if (!silent) {
      showSavedToast();
    }
  }

  /* ---------------------------
     Attach listeners
  --------------------------- */

  fields.forEach((el) => {
    // For toggles / checkboxes / selects: use change
    el.addEventListener("change", (e) => {
      updateSettingsFromElement(e.target);
    });

    // For text inputs / textarea: also save when user leaves field
    if (
      el.tagName === "INPUT" &&
      el.type !== "checkbox" &&
      el.type !== "radio"
    ) {
      el.addEventListener("blur", (e) => {
        updateSettingsFromElement(e.target);
      });
    }

    if (el.tagName === "TEXTAREA") {
      el.addEventListener("blur", (e) => {
        updateSettingsFromElement(e.target);
      });
    }
  });

  /* ---------------------------
     Optional: Save button
     <button data-settings-save>Save changes</button>
  --------------------------- */

  const saveBtn = document.querySelector("[data-settings-save]");
  if (saveBtn) {
    saveBtn.addEventListener("click", (e) => {
      e.preventDefault();

      // Push all current field values into settings and save
      fields.forEach((el) => updateSettingsFromElement(el, { silent: true }));
      showSavedToast();
    });
  }

  /* ---------------------------
     Tiny "Saved" toast
  --------------------------- */

  let toastTimeout = null;

  function showSavedToast() {
    let toast = document.getElementById("settings-saved-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "settings-saved-toast";
      toast.textContent = "Settings saved";
      Object.assign(toast.style, {
        position: "fixed",
        right: "1.5rem",
        bottom: "1.5rem",
        padding: "0.45rem 0.9rem",
        borderRadius: "999px",
        fontSize: "0.78rem",
        background:
          "linear-gradient(135deg, rgba(34,197,94,0.95), rgba(22,163,74,0.95))",
        color: "#022c22",
        boxShadow: "0 10px 30px rgba(0,0,0,0.35)",
        opacity: "0",
        transform: "translateY(8px)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        zIndex: "9999",
      });
      document.body.appendChild(toast);
    }

    // Show
    toast.style.opacity = "1";
    toast.style.transform = "translateY(0)";

    // Hide after 1.5s
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(8px)";
    }, 1500);
  }

  // Finally, hydrate UI with saved values
  applyInitialValues();
});
