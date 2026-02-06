// ===== CHART SETUP =====
const salesChart = new Chart(
  document.getElementById("salesChart"),
  {
    type: "line",
    data: {
      labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      datasets: [{
        label: "Sales",
        data: [],
        borderWidth: 2
      }]
    }
  }
);

const peakChart = new Chart(
  document.getElementById("peakChart"),
  {
    type: "bar",
    data: {
      labels: ["10am", "12pm", "2pm", "4pm", "6pm"],
      datasets: [{
        label: "Orders",
        data: []
      }]
    }
  }
);

// ===== FIREBASE REAL-TIME =====
const firebaseConfig = {
  apiKey: "AIzaSyD6epn2gBInFvjFX1ViEp_e5MDD1Su3cmM",
  authDomain: "fed-hawker-app-bf2ca.firebaseapp.com",
  projectId: "fed-hawker-app-bf2ca",
  storageBucket: "fed-hawker-app-bf2ca.firebasestorage.app",
  messagingSenderId: "909675653435",
  appId: "1:909675653435:web:fdc482bbffebcfe3a16f1e"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("analytics")
  .doc("vendorDashboard")
  .onSnapshot((doc) => {
    if (!doc.exists) return;
    const data = doc.data();

    document.getElementById("salesAmount").textContent =
      "$" + data.totalSales;

    document.getElementById("ordersCount").textContent =
      data.totalOrders;

    salesChart.data.datasets[0].data = data.salesTrend;
    salesChart.update();

    peakChart.data.datasets[0].data = data.peakHours;
    peakChart.update();
  });
