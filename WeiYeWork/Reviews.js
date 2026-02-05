document.addEventListener("DOMContentLoaded", () => {
    const bars = document.querySelectorAll(".bar-fill");

    // Get all counts
    const counts = Array.from(bars).map(bar =>
        Number(bar.dataset.count)
    );

    // Find highest count (for percentage scaling)
    const maxCount = Math.max(...counts);

    bars.forEach(bar => {
        const count = Number(bar.dataset.count);
        const percentage = (count / maxCount) * 100;
        bar.style.width = percentage + "%";
    });

    // Optional: total reviews
    const totalReviews = counts.reduce((a, b) => a + b, 0);
    document.getElementById("rating-summary-total").innerText =
        `${totalReviews} Total reviews`;
});

function renderStars(rating) {
    const starContainer = document.getElementById("rating-summary-stars");
    starContainer.innerHTML = ""; // clear previous

    const totalStars = 5;

    for (let i = 1; i <= totalStars; i++) {
        const wrapper = document.createElement("span");
        wrapper.classList.add("star-wrapper");

        const emptyStar = document.createElement("i");
        emptyStar.classList.add("fa", "fa-star", "star-empty");

        const fillStar = document.createElement("i");
        fillStar.classList.add("fa", "fa-star", "star-fill");

        let fillPercent = 0;
        if (rating >= i) {
            fillPercent = 100;          // full star
        } else if (rating + 1 > i) {
            fillPercent = (rating - (i - 1)) * 100; // partial star
        }

        fillStar.style.width = `${fillPercent}%`;

        wrapper.appendChild(emptyStar);
        wrapper.appendChild(fillStar);
        starContainer.appendChild(wrapper);
    }
}

// Example usage:
const rating = 3.6;
document.getElementById("rating-summary-number").textContent = rating.toFixed(1);
renderStars(rating);

