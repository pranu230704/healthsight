// js/main.js
// Shared logic for all pages:
// - Auto-highlight the active sidebar link based on current URL
// - Handle global topbar search (just logs for now)
// - Optional "Reset demo data" button using HealthSightAPI.resetDemoData()

document.addEventListener("DOMContentLoaded", () => {
  /* ---------------------------
     1) Sidebar active state
  --------------------------- */

  try {
    const path = window.location.pathname || "";
    let currentFile = path.split("/").pop() || "dashboard.html";

    // If user opens as file or directory root
    if (!currentFile || currentFile === "/") {
      currentFile = "dashboard.html";
    }

    const links = document.querySelectorAll(".sidebar-link");
    if (links.length > 0) {
      let activated = false;

      // Remove any hard-coded active classes first
      links.forEach((link) => link.classList.remove("active"));

      // Try to match link href to current file
      links.forEach((link) => {
        if (activated) return;

        const href = link.getAttribute("href") || "";
        const hrefFile = href.split("/").pop();

        if (hrefFile === currentFile) {
          link.classList.add("active");
          activated = true;
        }
      });

      // If nothing matched, default to dashboard link
      if (!activated) {
        links.forEach((link) => {
          const href = link.getAttribute("href") || "";
          const hrefFile = href.split("/").pop();
          if (!activated && hrefFile === "dashboard.html") {
            link.classList.add("active");
            activated = true;
          }
        });
      }
    }
  } catch (err) {
    console.warn("Failed to compute active sidebar link:", err);
  }

  /* ---------------------------
     2) Global topbar search
     (Just logs value when pressing Enter)
  --------------------------- */

  const globalSearchInput = document.querySelector(".topbar-search input");

  if (globalSearchInput) {
    globalSearchInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const value = globalSearchInput.value.trim();
        if (!value) return;

        console.log("[HealthSight] Global search:", value);

        // Later you can:
        // - redirect to patients.html with a query string
        // - or trigger a global search overlay.
        // For now, it only logs so it doesn't break anything.
      }
    });
  }

  /* ---------------------------
     3) Optional: "Reset demo data" button
     Add in HTML:
     <button class="btn-ghost" data-reset-demo>Reset demo data</button>
  --------------------------- */

  const resetBtn = document.querySelector("[data-reset-demo]");

  if (resetBtn && window.HealthSightAPI && typeof window.HealthSightAPI.resetDemoData === "function") {
    resetBtn.addEventListener("click", async () => {
      const ok = window.confirm(
        "Reset demo data for the HealthSight app?\nThis will clear local demo data and reload the page."
      );
      if (!ok) return;

      const originalText = resetBtn.textContent;
      resetBtn.disabled = true;
      resetBtn.textContent = "Resetting…";

      try {
        await window.HealthSightAPI.resetDemoData();
        window.location.reload();
      } catch (err) {
        console.error("Failed to reset demo data:", err);
        alert("Something went wrong while resetting demo data. Check console for details.");
        resetBtn.disabled = false;
        resetBtn.textContent = originalText || "Reset demo data";
      }
    });
  }
});
