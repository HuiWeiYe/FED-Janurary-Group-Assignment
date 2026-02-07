document.addEventListener("DOMContentLoaded", () => {

  // =========================
  // CONFIG
  // =========================
  const REVIEWS_PER_PAGE = 5;
  let currentPage = 1;

  // =========================
  // DOM ELEMENTS
  // =========================
  const container = document.getElementById("user-review-container");
  const pageNumber = document.getElementById("page-number");
  const leftArrow = document.getElementById("left-arrow");
  const rightArrow = document.getElementById("right-arrow");

  // =========================
  // FETCH DATA
  // =========================
  fetch("CustomerSample.json")
    .then(res => res.json())
    .then(data => {
      // Flatten reviews
      let allReviews = data.customers.flatMap(customer =>
        customer.reviews.map(review => ({
          customerName: customer.customerName,
          rating: review.rating,
          date: review.date,
          stall: review.stall,
          comment: review.comment,
          helpfulCount: review.helpfulCount
        }))
      );

      // =========================
      // SORT BY DATE (NEWEST FIRST)
      // =========================
      allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

      const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);

      // =========================
      // STAR RENDERER
      // =========================
      function renderStars(rating) {
        let stars = "";
        for (let i = 1; i <= 5; i++) {
          stars += i <= rating ? "★" : "☆";
        }
        return stars;
      }

      // =========================
      // RENDER REVIEWS
      // =========================
      function renderReviews() {
        container.innerHTML = "";

        const start = (currentPage - 1) * REVIEWS_PER_PAGE;
        const end = start + REVIEWS_PER_PAGE;
        const pageReviews = allReviews.slice(start, end);

        pageReviews.forEach(review => {
          const reviewEl = document.createElement("section");
          reviewEl.className = "user-review";

          reviewEl.innerHTML = `
            <div class="profile">
              <img class="user-picture" alt="User Profile">
              <div class="user-name">${review.customerName}</div>
            </div>

            <div class="information">
              <div class="user-stars">${renderStars(review.rating)}</div>
              <div class="user-date">${review.date}</div>
            </div>

            <div class="helpful-count">${review.helpfulCount} People found this review helpful</div>

            <div class="helpful-input">
              <div class="helpful-text">Was this review helpful?</div>
              <button class="helpful-button">
                <i class="fa-solid fa-thumbs-up"></i>
              </button>
              <button class="helpful-button">
                <i class="fa-solid fa-thumbs-down"></i>
              </button>
            </div>

            <div class="comments">
              <div class="user-comments">${review.comment}</div>
            </div>
          `;

          container.appendChild(reviewEl);
        });

        pageNumber.textContent = currentPage;
      }

      // =========================
      // PAGINATION CONTROLS
      // =========================
      leftArrow.addEventListener("click", () => {
        if (currentPage > 1) {
          currentPage--;
          renderReviews();
        }
      });

      rightArrow.addEventListener("click", () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderReviews();
        }
      });

      // =========================
      // INITIAL LOAD
      // =========================
      renderReviews();
    })
    .catch(err => console.error(err));
});
