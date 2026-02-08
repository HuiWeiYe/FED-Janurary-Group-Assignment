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
    const ratingFilter = document.getElementById("rating-filter");
    const helpfulFilter = document.getElementById("helpful-filter");

    const params = new URLSearchParams(window.location.search);
    const currentStall = params.get("stall");
    const stallImage = params.get("stallImage");
    const stallUnit = params.get("stallUnit");
    console.log(currentStall);

    // =========================
    // FETCH DATA
    // =========================
    fetch("CustomerSample.json")
        .then(res => res.json())
        .then(data => {
            // Flatten reviews
            let reviewIndex = 0;
            let allReviews = data.customers.flatMap(customer =>
                customer.reviews.map(review => ({
                    id: reviewIndex++,
                    customerName: customer.customerName,
                    rating: review.rating,
                    date: review.date,
                    stall: review.stall,
                    comment: review.comment,
                    helpfulCount: review.helpfulCount,
                    notHelpfulCount: review.notHelpfulCount,
                    userVote: null
                }))
            );

            // =========================
            // SORT BY DATE (NEWEST FIRST)
            // =========================
            allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

            const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);

            // =========================
            // FILTER
            // =========================
            function getFilteredReviews() {
                let filtered = [...allReviews];

                // Stall Filter
                if (currentStall) {
                    filtered = filtered.filter(review => review.stall === currentStall);
                }

                // Rating filter
                const ratingValue = ratingFilter.value;
                if (ratingValue) {
                    filtered = filtered.filter(
                        review => review.rating === parseInt(ratingValue)
                    );
                }

                const helpfulValue = helpfulFilter.value;
                if (helpfulValue === "most-helpful") {
                    filtered.sort((a, b) => {
                        if (b.helpfulCount !== a.helpfulCount) {
                            return b.helpfulCount - a.helpfulCount;
                        }
                        return new Date(b.date) - new Date(a.date); // tie-breaker
                    });
                }

                if (helpfulValue === "least-helpful") {
                    filtered.sort((a, b) => {
                        if (a.helpfulCount !== b.helpfulCount) {
                            return a.helpfulCount - b.helpfulCount;
                        }
                        return new Date(b.date) - new Date(a.date); // tie-breaker
                    });
                }

                return filtered;
            }



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
                const filteredReviews = getFilteredReviews();
                const pageReviews = filteredReviews.slice(start, end);
                const totalPagesFiltered = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
                if (currentPage > totalPagesFiltered) currentPage = totalPagesFiltered || 1;


                pageReviews.forEach(review => {
                    const reviewEl = document.createElement("section");
                    reviewEl.className = "user-review";

                    reviewEl.innerHTML = `
                        <div class="profile">
                            <img 
                                class="user-picture" 
                                alt="User Profile"
                                src="https://ui-avatars.com/api/?name=${encodeURIComponent(review.customerName)}&background=random&color=fff&size=128"
                            />
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
                            <span class="thumb-count">${review.helpfulCount}</span>
                            </button>
                            <button class="helpful-button">
                            <i class="fa-solid fa-thumbs-down"></i>
                            <span class="thumb-count">${review.notHelpfulCount}</span>
                            </button>
                        </div>

                        <div class="comments">
                            <div class="user-comments">${review.comment}</div>
                        </div>
                    `;

                    container.appendChild(reviewEl);
                });
                attachThumbsEvents(pageReviews);
                pageNumber.textContent = currentPage;
            }

            function attachThumbsEvents(pageReviews) {
                const reviewSections = container.querySelectorAll(".user-review");

                reviewSections.forEach((reviewEl, index) => {
                    const upBtn = reviewEl.querySelector(".fa-thumbs-up").parentElement;
                    const downBtn = reviewEl.querySelector(".fa-thumbs-down").parentElement;
                    const helpfulCountEl = reviewEl.querySelector(".helpful-count");
                    const upCountEl = upBtn.querySelector(".thumb-count");
                    const downCountEl = downBtn.querySelector(".thumb-count");
                    const reviewData = pageReviews[index];

                    let active = reviewData.userVote;

                    if (active === "up") upBtn.classList.add("active");
                    if (active === "down") downBtn.classList.add("active");

                    if (reviewData.notHelpfulCount === undefined) {
                        reviewData.notHelpfulCount = 0;
                    }

                    function updateHelpfulText() {
                        helpfulCountEl.textContent = `${reviewData.helpfulCount} People found this review helpful`;
                    }

                    upBtn.addEventListener("click", () => {
                        if (active === "up") {
                            active = null;
                            reviewData.helpfulCount--;
                            upBtn.classList.remove("active");
                        } else {
                            if (active === "down") {
                                reviewData.notHelpfulCount--;
                                downBtn.classList.remove("active");
                            }
                            active = "up";
                            reviewData.helpfulCount++;
                            upBtn.classList.add("active");
                        }
                        reviewData.userVote = active;

                        updateHelpfulText();
                        upCountEl.textContent = reviewData.helpfulCount;
                        downCountEl.textContent = reviewData.notHelpfulCount;
                    });

                    downBtn.addEventListener("click", () => {
                        if (active === "down") {
                            active = null;
                            reviewData.notHelpfulCount--;
                            downBtn.classList.remove("active");
                        } else {
                            if (active === "up") {
                                reviewData.helpfulCount--;
                                upBtn.classList.remove("active");
                            }
                            active = "down";
                            reviewData.notHelpfulCount++;
                            downBtn.classList.add("active");
                        }
                        reviewData.userVote = active;

                        updateHelpfulText();
                        upCountEl.textContent = reviewData.helpfulCount;
                        downCountEl.textContent = reviewData.notHelpfulCount;
                    });
                });
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
                const filteredReviews = getFilteredReviews(); // recalc filtered reviews
                const totalPagesFiltered = Math.ceil(filteredReviews.length / REVIEWS_PER_PAGE);
                if (currentPage < totalPagesFiltered) {
                    currentPage++;
                    renderReviews();
                }
            });


            // Filters
            ratingFilter.addEventListener("change", () => {
                currentPage = 1;
                renderReviews();
            });

            helpfulFilter.addEventListener("change", () => {
                currentPage = 1;
                renderReviews();
            });

            document.getElementById("return-arrow").addEventListener('click', () =>{
                window.location.href=`Reviews.html?stall=${encodeURIComponent(currentStall)}&from=Assignment.html&stallImage=${encodeURIComponent(stallImage)}&stallUnit=${encodeURIComponent(stallUnit)}`;
            });

            // =========================
            // INITIAL LOAD
            // =========================
            renderReviews();

        })
        .catch(err => console.error(err));
});
