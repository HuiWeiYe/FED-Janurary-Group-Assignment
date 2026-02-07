document.addEventListener("DOMContentLoaded", () => {
  const db = firebase.firestore();

  const params = new URLSearchParams(window.location.search);
  const stallId = params.get("stallId");

  const stallTitle = document.getElementById("stallTitle");
  const stallSubtitle = document.getElementById("stallSubtitle");
  const loading = document.getElementById("loading");
  const menuList = document.getElementById("menuList");
  const emptyState = document.getElementById("emptyState");

  function showLoading(show) {
    if (!loading) return;
    loading.style.display = show ? "flex" : "none";
  }

  function render(items) {
    if (!menuList) return;

    menuList.innerHTML = items.map((item) => `
      <div class="card" style="padding: 16px; margin-bottom: 12px;">
        <div style="display:flex; justify-content:space-between; gap:12px;">
          <div>
            <h3 style="margin:0;">${escapeHtml(item.name ?? "Unnamed item")}</h3>
            <p style="margin:6px 0 0; color: var(--text-medium);">
              ${escapeHtml(item.description ?? "")}
            </p>
            <p style="margin:6px 0 0; color: var(--text-light); font-size: 13px;">
              ${escapeHtml(item.category ?? "")} • ${escapeHtml(item.cuisine ?? "")}
            </p>
          </div>
          <div style="font-weight:700; white-space:nowrap;">
            $${Number(item.price ?? 0).toFixed(2)}
          </div>
        </div>
      </div>
    `).join("");
  }

  async function loadMenu() {
    if (!stallSubtitle || !stallTitle) return;

    if (!stallId) {
      stallSubtitle.textContent = "Missing stallId.";
      return;
    }

    stallTitle.textContent = `Menu (${stallId})`;
    stallSubtitle.textContent = "Loading items...";

    showLoading(true);

    try {
      // IMPORTANT: Firestore requires a composite index for multiple where clauses sometimes.
      // If this query returns nothing but you KNOW data exists, remove the "available" filter.
      const snap = await db.collection("menuItems")
        .where("stallId", "==", stallId)
        .where("available", "==", true)
        .get();

      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
        .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

      if (items.length === 0) {
        if (emptyState) emptyState.style.display = "block";
        if (menuList) menuList.innerHTML = "";
        stallSubtitle.textContent = "No available items.";
      } else {
        if (emptyState) emptyState.style.display = "none";
        render(items);
        stallSubtitle.textContent = `${items.length} item(s) available`;
      }
    } catch (e) {
      console.error(e);
      stallSubtitle.textContent = "Failed to load menu.";
    } finally {
      showLoading(false);
    }
  }

  loadMenu();
});

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m]));
}
