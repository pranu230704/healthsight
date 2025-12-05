// js/patients.js
// Controls the Patients page:
// - Loads patients from HealthSightAPI.listPatients()
// - Handles search, type & status filters
// - Renders the table and updates summary cards

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/patients.js."
    );
    return;
  }

  const tableBody = document.getElementById("patients-table-body");
  const searchInput = document.getElementById("patients-search");
  const typeFilterButtons = document.querySelectorAll("[data-pat-type]");
  const statusFilterButtons = document.querySelectorAll("[data-pat-status]");

  const filters = {
    type: "ALL",   // ALL, OPD, IPD, ER
    status: "ALL", // ALL, WAITING, IN_CONSULT, HIGH_RISK, ...
    search: "",
  };

  /* ---------------------------
     Helpers
  --------------------------- */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Map patient.status -> CSS class + label
  // Uses the classes from base.css (status-active, status-waiting, status-discharged, status-highrisk, status-inprogress)
  function mapPatientStatus(status) {
    const s = String(status || "").toUpperCase();

    switch (s) {
      case "WAITING":
        return { className: "status-waiting", label: "Waiting" };
      case "IN_CONSULT":
        return { className: "status-active", label: "In consult" };
      case "ICU_HIGH_RISK":
        return { className: "status-highrisk", label: "ICU high risk" };
      case "TRIAGE":
        return { className: "status-inprogress", label: "Triage" };
      case "DISCHARGED":
        return { className: "status-discharged", label: "Discharged" };
      default:
        return { className: "status-active", label: s || "Active" };
    }
  }

  // Apply front-end status filter on top of API results
  function applyStatusFilter(list) {
    const statusFilter = filters.status.toUpperCase();
    if (statusFilter === "ALL") return list;

    return list.filter((p) => {
      const s = String(p.status || "").toUpperCase();
      switch (statusFilter) {
        case "WAITING":
          // Waiting queue (including triage)
          return s === "WAITING" || s === "TRIAGE";
        case "IN_CONSULT":
          return s === "IN_CONSULT";
        case "HIGH_RISK":
          return s === "ICU_HIGH_RISK";
        default:
          return s === statusFilter;
      }
    });
  }

  function renderEmptyRow(message) {
    if (!tableBody) return;
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
     Load + render patients
  --------------------------- */

  async function loadAndRenderPatients() {
    if (!tableBody) {
      console.warn("No <tbody id='patients-table-body'> found.");
      return;
    }

    try {
      // Backend search + type filter
      const all = await HealthSightAPI.listPatients({
        query: filters.search,
        type: filters.type,
      });

      // Front-end status filter
      const visible = applyStatusFilter(all);

      renderTable(visible);
      updateSummaryCards(all);

      console.log("[Patients] Loaded:", {
        allCount: all.length,
        visibleCount: visible.length,
      });
    } catch (err) {
      console.error("Failed to load patients:", err);
      renderEmptyRow("Failed to load patients. Please try again.");
    }
  }

  function renderTable(patients) {
    tableBody.innerHTML = "";

    if (!patients || patients.length === 0) {
      renderEmptyRow("No patients found for the selected filters.");
      return;
    }

    patients.forEach((p) => {
      const row = document.createElement("tr");

      // Patient name + UHID
      const patientCell = document.createElement("td");
      patientCell.innerHTML = `
        <div style="font-size:0.82rem;">${p.name || "-"}</div>
        <div style="font-size:0.72rem;color:#9ca3af;">
          ${p.id || ""}
        </div>
      `;
      row.appendChild(patientCell);

      // Type (OPD / IPD / ER)
      const typeCell = document.createElement("td");
      typeCell.textContent = p.type || "-";
      row.appendChild(typeCell);

      // Department
      const deptCell = document.createElement("td");
      deptCell.textContent = p.department || "-";
      row.appendChild(deptCell);

      // Doctor info (we only have doctorId in api.js)
      const doctorCell = document.createElement("td");
      doctorCell.innerHTML = `
        <div style="font-size:0.8rem;">${p.doctorId || "-"}</div>
        <div style="font-size:0.72rem;color:#9ca3af;">
          Primary doctor ID
        </div>
      `;
      row.appendChild(doctorCell);

      // Last event / location
      const eventCell = document.createElement("td");
      eventCell.textContent = p.lastEvent || "—";
      row.appendChild(eventCell);

      // Status pill
      const statusCell = document.createElement("td");
      const { className, label } = mapPatientStatus(p.status);

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
     Summary cards (top tiles)
     Uses ALL patients (not filtered)
  --------------------------- */

  function updateSummaryCards(allPatients) {
    if (!Array.isArray(allPatients)) return;

    const total = allPatients.length;
    const opd = allPatients.filter((p) => p.type === "OPD").length;
    const ipd = allPatients.filter((p) => p.type === "IPD").length;
    const er = allPatients.filter((p) => p.type === "ER").length;

    const waiting = allPatients.filter((p) => {
      const s = String(p.status || "").toUpperCase();
      return s === "WAITING" || s === "TRIAGE";
    }).length;

    const highRisk = allPatients.filter(
      (p) => String(p.status || "").toUpperCase() === "ICU_HIGH_RISK"
    ).length;

    setText("pat-card-total", total);
    setText("pat-card-opd", opd);
    setText("pat-card-ipd", ipd);
    setText("pat-card-er", er);
    setText("pat-card-waiting", waiting);
    setText("pat-card-highrisk", highRisk);
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
        loadAndRenderPatients();
      }, 250);
    });
  }

  /* ---------------------------
     Type filter pills (OPD/IPD/ER)
  --------------------------- */

  if (typeFilterButtons.length > 0) {
    typeFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newType = (btn.dataset.patType || "ALL").toUpperCase();

        typeFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.type = newType === "ALL" ? "ALL" : newType;
        loadAndRenderPatients();
      });
    });
  }

  /* ---------------------------
     Status filter pills
  --------------------------- */

  if (statusFilterButtons.length > 0) {
    statusFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newStatus = (btn.dataset.patStatus || "ALL").toUpperCase();

        statusFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.status = newStatus;
        loadAndRenderPatients();
      });
    });
  }

  // Initial load
  loadAndRenderPatients();
});
