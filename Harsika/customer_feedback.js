const firebaseConfig = {
  apiKey: "AIzaSyD6epn2gBInFvjFX1ViEp_e5MDD1Su3cmM",
  authDomain: "fed-hawker-app-bf2ca.firebaseapp.com",
  projectId: "fed-hawker-app-bf2ca",
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

db.collection("analytics")
  .doc("customerFeedback")
  .onSnapshot((doc) => {
    if (!doc.exists) return;

    const data = doc.data();

    // ===== Average Rating =====
    const avg = data.averageRating;
    document.getElementById("avgRating").textContent = avg.toFixed(1);

    const starsDiv = document.getElementById("stars");
    starsDiv.innerHTML = "";
    const fullStars = Math.round(avg);

    for (let i = 0; i < 5; i++) {
      starsDiv.innerHTML += i < fullStars ? "★" : "☆";
    }

    // ===== Reviews =====
    const list = document.getElementById("reviewList");
    list.innerHTML = "";

    data.reviews.forEach((review) => {
      const li = document.createElement("li");
      li.className = "review-item";

      li.innerHTML = `
        <div class="review-header">
          <div>
            <div class="review-name">${review.name}</div>
            <div class="review-comment">${review.comment}</div>
          </div>
          <div class="review-stars">
            ${"★".repeat(review.rating)}
          </div>
        </div>
      `;

      list.appendChild(li);
    });
  });
