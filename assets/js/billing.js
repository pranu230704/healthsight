// js/billing.js
// Controls the Billing page: pulls summary data from HealthSightAPI.getBillingSummary()
// and fills the cards / labels on billing.html.

document.addEventListener("DOMContentLoaded", () => {
  if (!window.HealthSightAPI) {
    console.warn(
      "HealthSightAPI not found. Make sure js/api.js is loaded BEFORE js/billing.js."
    );
    return;
  }

  const rupeeFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  // Helper: set text if element exists
  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  async function loadBillingSummary() {
    try {
      const summary = await HealthSightAPI.getBillingSummary();

      // These keys come from api.js -> initialDb.billing
      const todayRevenue = summary.todayRevenue || 0;
      const billsCount = summary.todayBillsCount ?? 0;
      const avgBill = summary.averageBillValue || 0;
      const pending = summary.pendingClearance ?? 0;
      const lastSync = summary.lastSync || "—";

      // Fill the cards
      setText("billing-today-revenue", rupeeFmt.format(todayRevenue));
      setText("billing-bills-count", billsCount);
      setText("billing-avg-bill", rupeeFmt.format(avgBill));
      setText("billing-pending-count", pending);
      setText("billing-last-sync", lastSync);

      // Optional: log for debugging
      console.log("[Billing] Summary loaded:", summary);
    } catch (err) {
      console.error("Failed to load billing summary:", err);
    }
  }

  // Optional: hook up a "Refresh" button if it exists
  const refreshBtn = document.querySelector("[data-billing-refresh]");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", () => {
      refreshBtn.disabled = true;
      refreshBtn.textContent = "Refreshing…";

      loadBillingSummary().finally(() => {
        refreshBtn.disabled = false;
        refreshBtn.textContent = "↻ Refresh";
      });
    });
  }

  // First load when page opens
  loadBillingSummary();
});
