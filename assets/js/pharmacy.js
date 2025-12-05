// js/pharmacy.js
// Controls the Pharmacy page:
// - Loads items from HealthSightAPI.listPharmacyItems()
// - Handles search + stock status filters
// - Renders the table
// - Updates summary cards

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/pharmacy.js."
    );
    return;
  }

  const tableBody = document.getElementById("pharmacy-table-body");
  const searchInput = document.getElementById("pharmacy-search");
  const statusFilterButtons = document.querySelectorAll("[data-pharm-status]");

  const filters = {
    status: "ALL", // ALL, OK, LOW, CRITICAL, OUT
    search: "",
  };

  /* ---------------------------
     Helpers
  --------------------------- */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Map item.status -> CSS class + label
  // Uses classes defined in base.css: stock-ok, stock-low, stock-critical
  function mapStockStatus(status) {
    const s = String(status || "").toUpperCase();

    switch (s) {
      case "OK":
        return { className: "stock-ok", label: "Healthy" };
      case "LOW":
        return { className: "stock-low", label: "Low stock" };
      case "CRITICAL":
        return { className: "stock-critical", label: "Critical" };
      case "OUT":
        // Reuse critical styling but different label
        return { className: "stock-critical", label: "Out of stock" };
      default:
        return { className: "stock-low", label: s || "Check" };
    }
  }

  function applySearch(list) {
    const q = filters.search.trim().toLowerCase();
    if (!q) return list;

    return list.filter((item) => {
      const name = (item.name || "").toLowerCase();
      const code = (item.code || "").toLowerCase();
      const form = (item.form || "").toLowerCase();

      return (
        name.includes(q) ||
        code.includes(q) ||
        form.includes(q)
      );
    });
  }

  function renderEmptyRow(message) {
    if (!tableBody) return;
    tableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 5;
    cell.textContent = message;
    cell.style.fontSize = "0.8rem";
    cell.style.color = "#9ca3af";
    row.appendChild(cell);
    tableBody.appendChild(row);
  }

  /* ---------------------------
     Load + render pharmacy items
  --------------------------- */

  async function loadAndRenderPharmacy() {
    if (!tableBody) {
      console.warn("No <tbody id='pharmacy-table-body'> found.");
      return;
    }

    try {
      const all = await HealthSightAPI.listPharmacyItems({
        stockStatus: filters.status, // API already supports ALL / OK / LOW / CRITICAL / OUT
      });

      const visible = applySearch(all);

      renderTable(visible);
      updateSummaryCards(all);

      console.log("[Pharmacy] Loaded:", {
        allCount: all.length,
        visibleCount: visible.length,
      });
    } catch (err) {
      console.error("Failed to load pharmacy items:", err);
      renderEmptyRow("Failed to load pharmacy stock. Please try again.");
    }
  }

  function renderTable(items) {
    tableBody.innerHTML = "";

    if (!items || items.length === 0) {
      renderEmptyRow("No medicines found for the selected filters.");
      return;
    }

    items.forEach((item) => {
      const row = document.createElement("tr");

      // Name
      const nameCell = document.createElement("td");
      nameCell.textContent = item.name || "-";
      row.appendChild(nameCell);

      // Code + form
      const codeCell = document.createElement("td");
      codeCell.innerHTML = `
        <div style="font-size:0.8rem;">${item.code || "-"}</div>
        <div style="font-size:0.72rem;color:#9ca3af;">
          ${item.form || ""}
        </div>
      `;
      row.appendChild(codeCell);

      // Stock qty
      const stockCell = document.createElement("td");
      const stock = item.stock ?? 0;
      const unit = item.unit || "";
      stockCell.innerHTML = `
        <div style="font-size:0.82rem;">${stock} ${unit}</div>
      `;
      row.appendChild(stockCell);

      // Status pill
      const statusCell = document.createElement("td");
      const { className, label } = mapStockStatus(item.status);

      statusCell.innerHTML = `
        <span class="status-pill ${className}">
          <span class="dot"></span>
          ${label}
        </span>
      `;
      row.appendChild(statusCell);

      // Last movement / note
      const lastCell = document.createElement("td");
      lastCell.textContent = item.lastMovement || "—";
      row.appendChild(lastCell);

      tableBody.appendChild(row);
    });
  }

  /* ---------------------------
     Summary cards (top tiles)
     Uses ALL tracked items
  --------------------------- */

  function updateSummaryCards(allItems) {
    if (!Array.isArray(allItems)) return;

    const total = allItems.length;
    const ok = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "OK"
    ).length;
    const low = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "LOW"
    ).length;
    const critical = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "CRITICAL"
    ).length;
    const out = allItems.filter(
      (i) => String(i.status || "").toUpperCase() === "OUT"
    ).length;

    setText("pharm-card-total", total);
    setText("pharm-card-ok", ok);
    setText("pharm-card-low", low);
    setText("pharm-card-critical", critical);
    setText("pharm-card-out", out);
  }

  /* ---------------------------
     Search input
  --------------------------- */

  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      const value = e.target.value || "";
      filters.search = value;

      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadAndRenderPharmacy();
      }, 250);
    });
  }

  /* ---------------------------
     Status filter pills
  --------------------------- */

  if (statusFilterButtons.length > 0) {
    statusFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newStatus = (btn.dataset.pharmStatus || "ALL").toUpperCase();

        statusFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.status = newStatus;
        loadAndRenderPharmacy();
      });
    });
  }

  // Initial load
  loadAndRenderPharmacy();
});
