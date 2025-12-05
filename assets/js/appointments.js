// js/appointments.js
// Controls the Appointments page: loads data from HealthSightAPI
// and renders rows + basic filters.

// Map API status -> CSS class + label used in table
function mapStatus(status) {
  const upper = String(status || "").toUpperCase();

  switch (upper) {
    case "CONFIRMED":
      return { className: "status-confirmed", label: "Confirmed" };
    case "PENDING":
      return { className: "status-pending", label: "Pending" };
    case "CHECKED_IN":
      return { className: "status-checkedin", label: "Checked-in" };
    case "CANCELLED":
      return { className: "status-cancelled", label: "Cancelled" };
    case "NO_SHOW":
      return { className: "status-no-show", label: "No-show" };
    default:
      return { className: "status-pending", label: upper || "Pending" };
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn("HealthSightAPI not found. Did you include js/api.js before js/appointments.js?");
    return;
  }

  const tableBody = document.getElementById("appointments-table-body");
  const searchInput = document.getElementById("appointments-search");
  const statusFilterButtons = document.querySelectorAll("[data-apt-status]");

  // Current filter state for this page
  const filters = {
    status: "ALL",
    search: "",
  };

  /* ---------------------------
     Core: Load + render table
  --------------------------- */

  async function loadAndRenderAppointments() {
    try {
      const list = await HealthSightAPI.listAppointments({
        status: filters.status,
        search: filters.search,
      });

      renderTable(list);
      updateSummaryCards(list);
    } catch (err) {
      console.error("Failed to load appointments:", err);
    }
  }

  function renderTable(appointments) {
    if (!tableBody) {
      console.warn("No <tbody id='appointments-table-body'> found.");
      return;
    }

    // Clear existing rows
    tableBody.innerHTML = "";

    if (!appointments || appointments.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 6;
      cell.textContent = "No appointments found for the selected filters.";
      cell.style.fontSize = "0.8rem";
      cell.style.color = "#9ca3af";
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    appointments.forEach((apt) => {
      const row = document.createElement("tr");

      // Token
      const tokenCell = document.createElement("td");
      tokenCell.textContent = apt.token || "-";
      row.appendChild(tokenCell);

      // Time
      const timeCell = document.createElement("td");
      timeCell.textContent = apt.time || "-";
      row.appendChild(timeCell);

      // Patient
      const patientCell = document.createElement("td");
      patientCell.innerHTML = `
        <div style="font-size:0.8rem;">${apt.patientName || "-"}</div>
        ${
          apt.patientId
            ? `<div style="font-size:0.7rem;color:#9ca3af;">${apt.patientId}</div>`
            : ""
        }
      `;
      row.appendChild(patientCell);

      // Doctor
      const doctorCell = document.createElement("td");
      doctorCell.innerHTML = `
        <div style="font-size:0.8rem;">${apt.doctorName || "-"}</div>
        <div style="font-size:0.7rem;color:#9ca3af;">
          ${apt.department || "General"}
        </div>
      `;
      row.appendChild(doctorCell);

      // Type
      const typeCell = document.createElement("td");
      const niceType = String(apt.type || "OPD")
        .replace(/_/g, " ")
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase()); // title case

      typeCell.textContent = niceType;
      row.appendChild(typeCell);

      // Status pill
      const statusCell = document.createElement("td");
      const { className, label } = mapStatus(apt.status);

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
     Summary cards (optional)
     Will only update if IDs exist
  --------------------------- */

  function updateSummaryCards(list) {
    if (!Array.isArray(list)) return;

    const total = list.length;
    const confirmed = list.filter((a) => a.status === "CONFIRMED").length;
    const pending = list.filter((a) => a.status === "PENDING").length;
    const checkedIn = list.filter((a) => a.status === "CHECKED_IN").length;
    const cancelled = list.filter((a) =>
      ["CANCELLED", "NO_SHOW"].includes(a.status)
    ).length;

    const mapIdToValue = {
      "apt-card-total": total,
      "apt-card-confirmed": confirmed,
      "apt-card-pending": pending,
      "apt-card-checkedin": checkedIn,
      "apt-card-cancelled": cancelled,
    };

    Object.entries(mapIdToValue).forEach(([id, value]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = value;
    });
  }

  /* ---------------------------
     Search input (top bar)
  --------------------------- */

  if (searchInput) {
    let searchTimeout;

    searchInput.addEventListener("input", (e) => {
      const value = e.target.value || "";
      filters.search = value;

      // Simple debounce so we don't call API on every keystroke
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        loadAndRenderAppointments();
      }, 250);
    });
  }

  /* ---------------------------
     Status filter pills (optional)
     Example HTML for a pill:
     <button class="pill active" data-apt-status="ALL">All</button>
     <button class="pill" data-apt-status="CONFIRMED">Confirmed</button>
  --------------------------- */

  if (statusFilterButtons.length > 0) {
    statusFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newStatus = btn.dataset.aptStatus || "ALL";

        // Visual active state
        statusFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.status = newStatus;
        loadAndRenderAppointments();
      });
    });
  }

  // Initial load
  loadAndRenderAppointments();
});
