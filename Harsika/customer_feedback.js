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
    const avg = data.averageRating;
    document.getElementById("avgRating").textContent = avg.toFixed(1);

    // Stars
    const starsDiv = document.getElementById("stars");
    starsDiv.innerHTML = "";
    const fullStars = Math.round(avg);

    for (let i = 0; i < 5; i++) {
      starsDiv.innerHTML += i < fullStars ? "★" : "☆";
    }

    // Reviews
    const list = document.getElementById("reviewList");
    list.innerHTML = "";

    data.reviews.forEach((review) => {
      const li = document.createElement("li");
      li.className = "review-item";

      li.innerHTML = `
        <div class="review-header">
          <span class="review-name">${review.name}</span>
          <span class="review-stars">${"★".repeat(review.rating)}</span>
        </div>
        <p class="review-comment hidden">${review.comment}</p>
      `;

      // Toggle review text
      li.querySelector(".review-header").onclick = () => {
        li.querySelector(".review-comment").classList.toggle("hidden");
      };

      list.appendChild(li);
    });
  });
