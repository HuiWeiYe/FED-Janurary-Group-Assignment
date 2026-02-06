// ===== FIREBASE CONFIG =====
const firebaseConfig = {
  apiKey: "AIzaSyD6epn2gBInFvjFX1ViEp_e5MDD1Su3cmM",
  authDomain: "fed-hawker-app-bf2ca.firebaseapp.com",
  projectId: "fed-hawker-app-bf2ca",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// ===== REAL-TIME LISTENER =====
db.collection("analytics")
  .doc("customerFeedback")
  .onSnapshot((doc) => {
    if (!doc.exists) return;

    const data = doc.data();

    // Average rating
    document.getElementById("avgRating").textContent =
      data.averageRating.toFixed(1);

    // Stars
    const starsDiv = document.getElementById("stars");
    starsDiv.innerHTML = "";
    const fullStars = Math.round(data.averageRating);

    for (let i = 0; i < 5; i++) {
      starsDiv.innerHTML += i < fullStars ? "⭐" : "☆";
    }

    // Reviews
    const reviewList = document.getElementById("reviewList");
    reviewList.innerHTML = "";

    data.reviews.forEach((review) => {
      const li = document.createElement("li");
      li.className = "review-item";

      li.innerHTML = `
        <strong class="review-name">${review.name}</strong>
        <span class="review-stars">${"⭐".repeat(review.rating)}</span>
        <p class="review-comment hidden">${review.comment}</p>
      `;

      // CLICK NAME → TOGGLE COMMENT
      li.querySelector(".review-name").onclick = () => {
        li.querySelector(".review-comment").classList.toggle("hidden");
      };

      reviewList.appendChild(li);
    });
  });
