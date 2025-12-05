// js/doctors.js
// Controls the Doctors page: loads doctors from HealthSightAPI
// and renders the table + summary cards + filters.

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/doctors.js."
    );
    return;
  }

  const tableBody = document.getElementById("doctors-table-body");
  const searchInput = document.getElementById("doctors-search");
  const statusFilterButtons = document.querySelectorAll("[data-doc-status]");
  const deptFilterButtons = document.querySelectorAll("[data-doc-dept]");

  const filters = {
    status: "ALL",
    department: "ALL",
    search: "",
  };

  /* ---------------------------
     Helpers
  --------------------------- */

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  // Map doctor.status -> CSS class + label
  // Re-uses status-* classes you already have in base.css
  function mapDoctorStatus(status) {
    const s = String(status || "").toUpperCase();

    switch (s) {
      case "ON_DUTY":
        return { className: "status-active", label: "On duty" };
      case "IN_OT":
        return { className: "status-inprogress", label: "In OT" };
      case "ICU_ROUNDS":
        return { className: "status-highrisk", label: "ICU rounds" };
      case "OFF_DUTY":
        return { className: "status-no-show", label: "Off duty" };
      default:
        return { className: "status-pending", label: "Scheduled" };
    }
  }

  function applyFilters(list) {
    const q = filters.search.trim().toLowerCase();

    return list.filter((doc) => {
      // Status filter
      if (filters.status !== "ALL") {
        if (String(doc.status || "").toUpperCase() !== filters.status) {
          return false;
        }
      }

      // Department filter
      if (filters.department !== "ALL") {
        if ((doc.department || "") !== filters.department) {
          return false;
        }
      }

      // Search filter
      if (!q) return true;

      const name = (doc.name || "").toLowerCase();
      const dept = (doc.department || "").toLowerCase();
      const id = (doc.id || "").toLowerCase();

      return (
        name.includes(q) ||
        dept.includes(q) ||
        id.includes(q)
      );
    });
  }

  /* ---------------------------
     Load + render doctors
  --------------------------- */

  async function loadAndRenderDoctors() {
    try {
      const all = await HealthSightAPI.listDoctors();
      const visible = applyFilters(all);

      renderTable(visible);
      updateSummaryCards(all);

      console.log("[Doctors] Loaded:", { allCount: all.length, visibleCount: visible.length });
    } catch (err) {
      console.error("Failed to load doctors:", err);
    }
  }

  function renderTable(doctors) {
    if (!tableBody) {
      console.warn("No <tbody id='doctors-table-body'> found.");
      return;
    }

    tableBody.innerHTML = "";

    if (!doctors || doctors.length === 0) {
      const row = document.createElement("tr");
      const cell = document.createElement("td");
      cell.colSpan = 4;
      cell.textContent = "No doctors found for the selected filters.";
      cell.style.fontSize = "0.8rem";
      cell.style.color = "#9ca3af";
      row.appendChild(cell);
      tableBody.appendChild(row);
      return;
    }

    doctors.forEach((doc) => {
      const row = document.createElement("tr");

      // Doctor name + ID
      const docCell = document.createElement("td");
      docCell.innerHTML = `
        <div style="font-size:0.82rem;">${doc.name || "-"}</div>
        <div style="font-size:0.72rem;color:#9ca3af;">
          ${doc.id || ""}
        </div>
      `;
      row.appendChild(docCell);

      // Department
      const deptCell = document.createElement("td");
      deptCell.textContent = doc.department || "-";
      row.appendChild(deptCell);

      // Slots info (booked / total)
      const slotsCell = document.createElement("td");
      const total = doc.slotsToday ?? 0;
      const booked = doc.slotsBooked ?? 0;
      const remaining = Math.max(0, total - booked);
      const utilization =
        total > 0 ? Math.round((booked / total) * 100) : 0;

      slotsCell.innerHTML = `
        <div style="font-size:0.82rem;">${booked} / ${total} slots</div>
        <div style="font-size:0.72rem;color:#9ca3af;">
          ${remaining} open · ${utilization}% filled
        </div>
      `;
      row.appendChild(slotsCell);

      // Status pill
      const statusCell = document.createElement("td");
      const { className, label } = mapDoctorStatus(doc.status);

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
     Summary cards
     (Uses ALL doctors, not filtered)
  --------------------------- */

  function updateSummaryCards(allDoctors) {
    if (!Array.isArray(allDoctors)) return;

    const total = allDoctors.length;
    const onDuty = allDoctors.filter(
      (d) => String(d.status || "").toUpperCase() === "ON_DUTY"
    ).length;
    const inOt = allDoctors.filter(
      (d) => String(d.status || "").toUpperCase() === "IN_OT"
    ).length;
    const icuRounds = allDoctors.filter(
      (d) => String(d.status || "").toUpperCase() === "ICU_ROUNDS"
    ).length;

    // Slot utilization across all doctors
    const totalSlots = allDoctors.reduce(
      (sum, d) => sum + (d.slotsToday ?? 0),
      0
    );
    const totalBooked = allDoctors.reduce(
      (sum, d) => sum + (d.slotsBooked ?? 0),
      0
    );
    const utilization =
      totalSlots > 0 ? Math.round((totalBooked / totalSlots) * 100) : 0;

    setText("doc-card-total", total);
    setText("doc-card-on-duty", onDuty);
    setText("doc-card-in-ot", inOt);
    setText("doc-card-icu-rounds", icuRounds);
    setText("doc-card-utilization", utilization + "%");
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
        loadAndRenderDoctors();
      }, 250);
    });
  }

  /* ---------------------------
     Status filter pills
  --------------------------- */

  if (statusFilterButtons.length > 0) {
    statusFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const newStatus = (btn.dataset.docStatus || "ALL").toUpperCase();

        // Visual active state
        statusFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.status = newStatus;
        loadAndRenderDoctors();
      });
    });
  }

  /* ---------------------------
     Department filter pills
  --------------------------- */

  if (deptFilterButtons.length > 0) {
    deptFilterButtons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const dept = btn.dataset.docDept || "ALL";

        deptFilterButtons.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");

        filters.department = dept;
        loadAndRenderDoctors();
      });
    });
  }

  // Initial load
  loadAndRenderDoctors();
});
