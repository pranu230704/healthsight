// js/lab-reports.js
// Controls the Lab Reports page:
// - Loads lab reports from HealthSightAPI
// - Renders table
// - Handles search + status filters
// - Updates summary cards

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/lab-reports.js."
    );
    return;
  }

  const tableBody = document.getElementById("lab-reports-table-body");
  const searchInput = document.getElementById("lab-reports-search");
  const statusFilterButtons = document.querySelectorAll("[data-lab-status]");

  const filters = {
    status: "ALL", // ALL, COMPLETED, IN_PROGRESS, SAMPLE_COLLECTED, CANCELLED, etc.
    search: "",
  };

  /* ---------------------------
     Helpers
  --------------------------- */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function mapLabStatus(status) {
    const s = String(status || "").toUpperCase();

    // Re-use your existing CSS classes from base.css
    switch (s) {
      case "COMPLETED":
        return { className: "status-complete", label: "Completed" };
      case "IN_PROGRESS":
        return { className: "status-inprogress", label: "In progress" };
      case "SAMPLE_COLLECTED":
        return { className: "status-inprogress", label: "Sample collected" };
      case "CANCELLED":
        return { className: "status-cancelled", label: "Cancelled" };
      case "CRITICAL":
        // use high-risk styling from patients
        return { className: "status-highrisk", label: "Critical" };
      default:
        return { className: "status-inprogress", label: s || "In progress" };
    }
  }

  function applyFilters(list) {
    const q = filters.search.trim().toLowerCase();
    const statusFilter = filters.status.toUpperCase();

    return list.filter((rep) => {
      // status filter
      if (statusFilter !== "ALL") {
        if (String(rep.status || "").toUpperCase() !== statusFilter) {
          return false;
        }
      }

      if (!q) return true;

      const name = (rep.patientName || "").toLowerCase();
      const uhid = (rep.patientId || "").toLowerCase();
      const test = (rep.testName || "").toLowerCase();
      const dept = (rep.department || "").toLowerCase();

      return (
        name.includes(q) ||
        uhid.includes(q) ||
        test.includes(q) ||
        dept.includes(q)
      );
    });
  }

  function renderEmptyRow(message) {
    tableBody.innerHTML = "";
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = 6;
    cell.textContent = message;
    cell.style.fontSize = "0.8rem";
    cell.style.color = "#9ca3af";
    row.appendChild(cell);
    tableBody.appendChild(row);
  }

  /* ---------------------------
     Load + render lab reports
  --------------------------- */

  async function loadAndRenderLabReports() {
    if (!tableBody) {
      console.warn("No <tbody id='lab-reports-table-body'> found.");
      return;
    }

    try {
      // Get all reports from API, then apply front-end filters
      const all = await HealthSightAPI.listLabReports({ status: "ALL" });
      const visible = applyFilters(all);

      renderTable(visible);
      updateSummaryCards(all);

      console.log("[LabReports] Loaded:", {
        allCount: all.length,
        visibleCount: visible.length,
      });
    } catch (err) {
      console.error("Failed to load lab reports:", err);
      renderEmptyRow("Failed to load lab reports. Please try again.");
    }
  }

  function renderTable(reports) {
    tableBody.innerHTML = "";

    if (!reports || reports.length === 0) {
      renderEmptyRow("No lab reports found for the selected filters.");
      return;
    }

    reports.forEach((rep) => {
      const row = document.createElement("tr");

      // Test name
      const testCell = document.createElement("td");
      testCell.textContent = rep.testName || "-";
      row.appendChild(testCell);

      // Patient
      const patientCell = document.createElement("td");
      patientCell.innerHTML = `
        <div style="font-size:0.8rem;">${rep.patientName || "-"}</div>
        <div style="font-size:0.7rem;color:#9ca3af;">
          ${rep.patientId || ""}
        </div>
      `;
      row.appendChild(patientCell);

      // Department
      const deptCell = document.createElement("td");
      deptCell.textContent = rep.department || "-";
      row.appendChild(deptCell);

      // TAT
      const tatCell = document.createElement("td");
      tatCell.textContent = rep.tatMinutes
        ? `${rep.tatMinutes} min`
        : "—";
      row.appendChild(tatCell);

      // Collected time
      const collectedCell = document.createElement("td");
      collectedCell.textContent = rep.collectedAt || "-";
      row.appendChild(collectedCell);

      // Status pill
      const statusCell = document.createElement("td");
      const { className, label } = mapLabStatus(rep.status);

      statusCell.innerHTML = `
        <span class="status-pill ${className}">
          <span class="dot"></span>
          ${label}
        </span>
      `;
      row.appendChild(statusCell);

      tableBody.appendChild(row);
    });
  }

  /* ---------------------------
     Summary cards (top KPIs)
     Uses ALL reports (not filtered)
  --------------------------- */

  function updateSummaryCards(allReports) {
    if (!Array.isArray(allReports)) return;

    const total = allReports.length;
    const completed = allReports.filter(
      (r) => String(r.status || "").toUpperCase() === "COMPLETED"
    ).length;
    const inprogress = allReports.filter((r) =>
      ["IN_PROGRESS", "SAMPLE_COLLECTED"].includes(
        String(r.status || "").toUpperCase()
      )
    ).length;

    // "Delayed" = completed with TAT > 45 minutes (you can tweak this)
    const delayed = allReports.filter((r) => {
      const s = String(r.status || "").toUpperCase();
      if (s !== "COMPLETED") return false;
      if (typeof r.tatMinutes !== "number") return false;
      return r.tatMinutes > 45;
    }).length;

    const tatNumbers = allReports
      .map((r) => r.tatMinutes)
      .filter((n) => typeof n === "number" && !isNaN(n));

    const avgTat =
      tatNumbers.length > 0
        ? Math.round(
            tatNumbers.reduce((sum, n) => sum + n, 0) / tatNumbers.length
          )
        : 0;

    setText("lab-card-total", total);
    setText("lab-card-completed", completed);
    setText("lab-card-inprogress", inprogress);
    setText("lab-card-delayed", delayed);
    setText("lab-card-avg-tat", avgTat ? `${avgTat} min` : "—");
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
        loadAndRenderLabReports();
      }, 250);
    });
  }

  /* ---------------------------
     Status filter pills
  --------------------------- */

  if (statusFilterButtons.length > 0) {
    statusFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newStatus = (btn.dataset.labStatus || "ALL").toUpperCase();

        statusFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.status = newStatus;
        loadAndRenderLabReports();
      });
    });
  }

  // Initial load
  loadAndRenderLabReports();
});
