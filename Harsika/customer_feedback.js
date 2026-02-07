const firebaseConfig = {
  apiKey: "AIzaSyD6epn2gBInFvjFX1ViEp_e5MDD1Su3cmM",
  authDomain: "fed-hawker-app-bf2ca.firebaseapp.com",
  projectId: "fed-hawker-app-bf2ca"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("analytics")
  .doc("customerFeedback")
  .onSnapshot(doc => {
    if (!doc.exists) return;
    const data = doc.data();

    // Overall
    document.getElementById("overallRating").textContent = data.averageRating;
    document.getElementById("totalRatings").textContent =
      `(${data.totalRatings} ratings overall)`;

    // Food quality
    document.getElementById("foodRating").textContent = data.foodQuality.rating;
    document.getElementById("foodCount").textContent =
      `${data.foodQuality.count} ratings`;
    document.getElementById("foodStars").innerHTML =
      "★".repeat(Math.round(data.foodQuality.rating));

    // Delivery service
    document.getElementById("deliveryRating").textContent = data.deliveryService.rating;
    document.getElementById("deliveryCount").textContent =
      `${data.deliveryService.count} ratings`;
    document.getElementById("deliveryStars").innerHTML =
      "★".repeat(Math.round(data.deliveryService.rating));

    // Comments preview
    const preview = document.getElementById("commentPreview");
    preview.innerHTML = "";
    data.reviews.slice(0, 3).forEach(r => {
      preview.innerHTML += `<li><strong>${r.name}</strong>: ${r.comment}</li>`;
    });

    // Customer table
    const table = document.getElementById("customerTable");
    table.innerHTML = "";
    data.reviews.forEach(r => {
      table.innerHTML += `
        <tr>
          <td>${r.name}</td>
          <td>${"★".repeat(r.foodRating)}</td>
          <td>${"★".repeat(r.deliveryRating)}</td>
          <td>${r.deliveryTime}</td>
          <td>${r.comment}</td>
        </tr>
      `;
    });
  });
