import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";
import { set, push, update } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDCWdRLOOjQJQkuCyB2tUBTddgtJvdna2M",
  authDomain: "fed-customer-review.firebaseapp.com",
  databaseURL: "https://fed-customer-review-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fed-customer-review",
  storageBucket: "fed-customer-review.firebasestorage.app",
  messagingSenderId: "574394175471",
  appId: "1:574394175471:web:7a02132fa3be0cec10701a"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {

    // Declaring variables
    const REVIEWS_PER_PAGE = 5;
    let currentPage = 1;

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

    // Fetch data
    get(ref(database, "customers"))
    .then(snapshot => {
        const rawData = snapshot.val();

        // Convert object to array
        const data = { customers: Object.values(rawData || {}) };

            // Flatten reviews
            // let reviewIndex = 0;
            // let allReviews = data.customers.flatMap(customer => {
            //     const reviews = Object.values(customer.reviews || {});
            //     return reviews
            //         .filter(r => r.stall && r.rating != null) 
            //         .map(r => ({
            //             id: reviewIndex++,
            //             customerName: customer.customerName || "Anonymous",
            //             rating: Number(r.rating),           
            //             date: r.date || "2026-01-01",      
            //             stall: r.stall,
            //             comment: r.comment || "",
            //             helpfulCount: Number(r.helpfulCount) || 0,
            //             notHelpfulCount: Number(r.notHelpfulCount) || 0,
            //             userVote: null
            //         }));
            // });

            let reviewIndex = 0;
            let allReviews = Object.entries(rawData || {}).flatMap(([custKey, customer]) => {
                return Object.entries(customer.reviews || {}).map(([revKey, r]) => ({
                    id: reviewIndex++,
                    customerName: customer.customerName || "Anonymous",
                    rating: Number(r.rating),           
                    date: r.date || "2026-01-01",      
                    stall: r.stall,
                    comment: r.comment || "",
                    helpfulCount: Number(r.helpfulCount) || 0,
                    notHelpfulCount: Number(r.notHelpfulCount) || 0,
                    userVote: null,
                    firebasePath: `customers/${custKey}/reviews/${revKey}` 
                }));
            });

            // Sort by date - Recent to latest
            allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

            const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);

            // Filtering
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
                        // Incase tied sort by date
                        return new Date(b.date) - new Date(a.date);
                    });
                }

                if (helpfulValue === "least-helpful") {
                    filtered.sort((a, b) => {
                        if (a.helpfulCount !== b.helpfulCount) {
                            return a.helpfulCount - b.helpfulCount;
                        }
                        // Incase tied sort by date
                        return new Date(b.date) - new Date(a.date); 
                    });
                }

                return filtered;
            }



            // Render Stars
            function renderStars(rating) {
                let stars = "";
                for (let i = 1; i <= 5; i++) {
                    stars += i <= rating ? "★" : "☆";
                }
                return stars;
            }

            // Render Reviews
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

            function shouldResort() {
                return helpfulFilter.value === "most-helpful" ||
                    helpfulFilter.value === "least-helpful";
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

                    // Prevents thumbs up or down on ur own reviews
                    if (reviewData.customerName === "You") {
                        upBtn.disabled = true;
                        downBtn.disabled = true;
                        upBtn.classList.add("disabled");
                        downBtn.classList.add("disabled");
                        return;
                    }

                    let active = reviewData.userVote;

                    if (active === "up") upBtn.classList.add("active");
                    if (active === "down") downBtn.classList.add("active");

                    if (reviewData.notHelpfulCount === undefined) {
                        reviewData.notHelpfulCount = 0;
                    }

                    function updateHelpfulText() {
                        helpfulCountEl.textContent = `${reviewData.helpfulCount} People found this review helpful`;
                    }

                    // Logic for thumbs up button
                    upBtn.addEventListener("click", () => {

                        // Checks if button is active ( Pressed on either up  button ) - Removes like if true
                        if (active === "up") {
                            active = null;
                            reviewData.helpfulCount--;
                            upBtn.classList.remove("active");
                        
                        // Checks if button is inactive ( Pressed on either down button ) - Removes dislike if true then turns like on
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

                        // Updates text
                        updateHelpfulText();
                        upCountEl.textContent = reviewData.helpfulCount;
                        downCountEl.textContent = reviewData.notHelpfulCount;

                        if (shouldResort()) renderReviews();

                        // Updates firebase
                        update(ref(database, reviewData.firebasePath), {
                            helpfulCount: reviewData.helpfulCount,
                            notHelpfulCount: reviewData.notHelpfulCount
                        }).catch(err => console.error(err));


                    });

                    // Logic for thumbs up button ( Logic same for above )
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

                        if (shouldResort()) renderReviews();

                        update(ref(database, reviewData.firebasePath), {
                            helpfulCount: reviewData.helpfulCount,
                            notHelpfulCount: reviewData.notHelpfulCount
                        }).catch(err => console.error(err));


                    });
                });
            }

            // Writing a review
            const submitBtn = document.getElementById("submit-review");
            const ratingInput = document.getElementById("review-rating");
            const commentInput = document.getElementById("review-comment");


            submitBtn.addEventListener("click", () => {
                const rating = parseInt(ratingInput.value);
                const comment = commentInput.value.trim();

                // Prompts incase review box is empty or star rating is empty
                if (!rating || !comment) {
                    alert("Please provide a rating and a review.");
                    return;
                }

                const newReview = {
                    rating: rating,
                    comment: comment,
                    date: new Date().toISOString().slice(0, 10),
                    stall: currentStall,
                    helpfulCount: 0,
                    notHelpfulCount: 0
                };

                // Check if user review already exist
                get(ref(database, "customers"))
                    .then(snapshot => {
                        const customers = snapshot.val() || {};
                        let youCustomerId = null;

                        // Find existing customer
                        for (const [key, customer] of Object.entries(customers)) {
                            if (customer.customerName === "You") {
                                youCustomerId = key;
                                break;
                            }
                        }

                        if (youCustomerId === null) {
                            // create new customer
                            const newCustomerRef = push(ref(database, "customers"));
                            youCustomerId = newCustomerRef.key;
                            set(newCustomerRef, {
                                customerName: "You",
                                reviews: {} 
                            });
                        }

                        // Push the new review
                        const reviewsRef = ref(database, `customers/${youCustomerId}/reviews`);
                        const newReviewRef = push(reviewsRef);
                        set(newReviewRef, newReview)
                            .then(() => {

                                // Update local array and render
                                allReviews.unshift({
                                    id: allReviews.length,
                                    customerName: "You",
                                    ...newReview,
                                    userVote: null
                                });
                                currentPage = 1;
                                renderReviews();

                                // reset form
                                ratingInput.value = "";
                                commentInput.value = "";
                            })
                            .catch(err => console.error(err));
                    })
                    .catch(err => console.error(err));
            });


            // Turn to next or previous page of reviews
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

            // Goes back to summary page with relevant data to load page
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
