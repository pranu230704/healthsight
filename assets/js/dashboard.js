// js/dashboard.js
// Wires your dashboard.html to HealthSightAPI (api.js):
// - Fills summary tiles
// - Populates "Latest Appointments" table
// - Populates "Lab Report Status" table
// - Shows pharmacy low stock count

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/dashboard.js."
    );
    return;
  }

  /* ---------------------------
     Helpers
  --------------------------- */

  const rupeeFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setBarWidth(id, percent) {
    const el = document.getElementById(id);
    if (!el) return;
    const safe = Math.max(0, Math.min(100, percent || 0));
    el.style.width = safe + "%";
  }

  // Small helper for empty-table message
  function renderEmptyRow(tbody, colSpan, message) {
    const row = document.createElement("tr");
    const cell = document.createElement("td");
    cell.colSpan = colSpan;
    cell.textContent = message;
    cell.style.fontSize = "0.8rem";
    cell.style.color = "#9ca3af";
    row.appendChild(cell);
    tbody.appendChild(row);
  }

  /* ---------------------------
     1) Dashboard snapshot tiles
  --------------------------- */

  async function loadDashboardSnapshot() {
    try {
      const snap = await HealthSightAPI.getDashboardSnapshot();

      // Values defined in api.js -> initialDb.dashboardSnapshot
      const daily = snap.dailyConsultations ?? 0;
      const revenue = snap.revenueToday ?? 0;
      const bedOcc = snap.bedOccupancyPercent ?? 0;
      const emerg = snap.emergencyCases ?? 0;
      const staff = snap.staffOnDuty ?? 0;
      const last = snap.lastUpdated || "—";

      setText("dash-daily-consultations", daily);
      setText("dash-revenue-today", rupeeFmt.format(revenue));
      setText("dash-bed-occupancy", bedOcc + "%");
      setText("dash-emergency-cases", emerg);
      setText("dash-staff-on-duty", staff);
      setText("dash-last-updated", last);

      setBarWidth("dash-bed-occupancy-bar", bedOcc);

      // Optional console log
      console.log("[Dashboard] Snapshot:", snap);
    } catch (err) {
      console.error("Failed to load dashboard snapshot:", err);
    }
  }

  /* ---------------------------
     2) Latest Appointments table
  --------------------------- */

  async function loadLatestAppointments() {
    const tbody = document.getElementById("dash-latest-appointments-body");
    if (!tbody) {
      // If you don't have this table on dashboard, it's fine.
      return;
    }

    try {
      const all = await HealthSightAPI.listAppointments({
        status: "ALL",
      });

      // Take top 6 (you can change this)
      const list = all.slice(0, 6);

      tbody.innerHTML = "";

      if (list.length === 0) {
        renderEmptyRow(
          tbody,
          6,
          "No recent appointments found for today."
        );
        return;
      }

      list.forEach((apt) => {
        const row = document.createElement("tr");

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
          .replace(/\b\w/g, (c) => c.toUpperCase());
        typeCell.textContent = niceType;
        row.appendChild(typeCell);

        // Status (simpler badge for dashboard)
        const statusCell = document.createElement("td");
        const badgeColor = (() => {
          switch (String(apt.status || "").toUpperCase()) {
            case "CONFIRMED":
              return "var(--accent-soft)";
            case "CHECKED_IN":
              return "rgba(129, 140, 248, 0.18)";
            case "CANCELLED":
              return "var(--danger-soft)";
            case "NO_SHOW":
              return "rgba(148, 163, 184, 0.16)";
            default:
              return "var(--info-soft)";
          }
        })();

        statusCell.innerHTML = `
          <span style="
            display:inline-flex;
            align-items:center;
            padding:0.14rem 0.55rem;
            border-radius:999px;
            font-size:0.7rem;
            background:${badgeColor};
          ">
            ${String(apt.status || "Pending").replace(/_/g, " ")}
          </span>
        `;
        row.appendChild(statusCell);

        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Failed to load latest appointments:", err);
    }
  }

  /* ---------------------------
     3) Lab Report Status table
  --------------------------- */

  async function loadLabReportsStatus() {
    const tbody = document.getElementById("dash-lab-reports-body");
    if (!tbody) return;

    try {
      const all = await HealthSightAPI.listLabReports({ status: "ALL" });
      const list = all.slice(0, 6); // top few

      tbody.innerHTML = "";

      if (list.length === 0) {
        renderEmptyRow(
          tbody,
          6,
          "No lab reports available for the selected period."
        );
        return;
      }

      list.forEach((rep) => {
        const row = document.createElement("tr");

        // Test
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

        // Dept
        const deptCell = document.createElement("td");
        deptCell.textContent = rep.department || "-";
        row.appendChild(deptCell);

        // TAT
        const tatCell = document.createElement("td");
        tatCell.textContent = rep.tatMinutes
          ? `${rep.tatMinutes} min`
          : "—";
        row.appendChild(tatCell);

        // Collected at
        const collectedCell = document.createElement("td");
        collectedCell.textContent = rep.collectedAt || "-";
        row.appendChild(collectedCell);

        // Status pill (same classes as base.css for lab)
        const statusCell = document.createElement("td");
        const s = String(rep.status || "").toUpperCase();

        let cls = "status-inprogress";
        let label = "In progress";

        if (s === "COMPLETED") {
          cls = "status-complete";
          label = "Completed";
        } else if (s === "SAMPLE_COLLECTED") {
          cls = "status-inprogress";
          label = "Sample collected";
        } else if (s === "CANCELLED") {
          cls = "status-cancelled"; // reuse from appointments; you have styles
          label = "Cancelled";
        }

        statusCell.innerHTML = `
          <span class="status-pill ${cls}">
            <span class="dot"></span>
            ${label}
          </span>
        `;
        row.appendChild(statusCell);

        tbody.appendChild(row);
      });
    } catch (err) {
      console.error("Failed to load lab reports:", err);
    }
  }

  /* ---------------------------
     4) Pharmacy low stock badge
  --------------------------- */

  async function loadPharmacyLowStock() {
    const target = document.getElementById("dash-pharmacy-low-stock");
    if (!target) return;

    try {
      const summary = await HealthSightAPI.getLowStockSummary();
      const lowCount = summary.lowCount ?? 0;
      target.textContent = lowCount;
    } catch (err) {
      console.error("Failed to load pharmacy low stock summary:", err);
    }
  }

  /* ---------------------------
     5) Refresh button (optional)
  --------------------------- */

  const refreshBtn = document.querySelector("[data-dashboard-refresh]");

  function refreshDashboard() {
    return Promise.all([
      loadDashboardSnapshot(),
      loadLatestAppointments(),
      loadLabReportsStatus(),
      loadPharmacyLowStock(),
    ]);
  }

  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.disabled = true;
      const oldText = refreshBtn.textContent;
      refreshBtn.textContent = "Refreshing…";

      refreshDashboard().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = oldText || "↻ Refresh";
      });
    });
  }

  // Initial load when page opens
  refreshDashboard();
});
