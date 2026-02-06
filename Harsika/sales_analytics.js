// ===== FIREBASE =====
const firebaseConfig = {
  apiKey: "AIzaSyD6epn2gBInFvjFX1ViEp_e5MDD1Su3cmM",
  authDomain: "fed-hawker-app-bf2ca.firebaseapp.com",
  projectId: "fed-hawker-app-bf2ca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== CHARTS =====
const salesTrendChart = new Chart(
  document.getElementById("salesTrendChart"),
  {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Sales",
        data: [],
        borderWidth: 2,
        tension: 0.4
      }]
    }
  }
);

const peakHoursChart = new Chart(
  document.getElementById("peakHoursChart"),
  {
    type: "bar",
    data: {
      labels: [],
      datasets: [{
        label: "Orders",
        data: []
      }]
    }
  }
);

// ===== REAL-TIME LISTENER =====
let currentRange = "daily";

function listenToAnalytics(range) {
  db.collection("analytics")
    .doc("salesAnalytics")
    .onSnapshot(doc => {
      if (!doc.exists) return;
      const data = doc.data()[range];

      // Sales Trend
      salesTrendChart.data.labels = data.sales.labels;
      salesTrendChart.data.datasets[0].data = data.sales.values;
      salesTrendChart.update();

      // Peak Hours
      peakHoursChart.data.labels = data.peak.labels;
      peakHoursChart.data.datasets[0].data = data.peak.values;
      peakHoursChart.update();
    });
}

// Initial load
listenToAnalytics(currentRange);

// ===== FILTER BUTTONS =====
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn")
      .forEach(b => b.classList.remove("active"));

    btn.classList.add("active");
    currentRange = btn.dataset.range;
    listenToAnalytics(currentRange);
  });
});
