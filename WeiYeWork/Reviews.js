import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

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

const params = new URLSearchParams(window.location.search);
const stallTitle = params.get("stall");
const stallImage = params.get("stallImage");
const stallUnit = params.get("stallUnit")

console.log(stallTitle);
console.log(stallImage);
console.log(stallUnit);

// Loading rating bars
document.addEventListener("DOMContentLoaded", () => {
    
    const bars = document.querySelectorAll(".bar-fill");
    const starContainer = document.getElementById("rating-summary-stars");
    const reviewTitle = document.getElementById("review-title")
    const reviewLocation = document.getElementById("review-location")
    const reviewImage = document.getElementById("review-stall-image");
    starContainer.innerHTML = "";
    const totalStars = 5;

    // Updates stall information
    if (stallTitle != null) { reviewTitle.textContent = `${stallTitle} Stall`; }
    else { reviewTitle.textContent = `Placeholder Stall`; }

    if (stallImage != null) { reviewImage.src = `${stallImage}`; }
    else { reviewImage.src = `None`; }
    
    if (stallUnit != null) { reviewLocation.textContent = `${stallUnit}`; }
    else { reviewLocation.textContent = `#X-XX`; }

    // Fetches data
    get(ref(database, "customers"))
        .then(snapshot => {
            const data = {customers: snapshot.val()};
            const customersArray = Object.values(data.customers || {});

            // Gets array of data for every customer review that are reviewing current stall
            const counts = customersArray.flatMap(customer => 
                Object.values(customer.reviews || {}) // Convert object to array
                    .filter(review => review.stall && review.stall.toLowerCase() === stallTitle.toLowerCase())
                    .map(review => review.rating)
            );
            console.log(counts);
            
            // Calculates for average star rating
            const maxCount = counts.reduce((total, current) => total + current, 0);
            const averageRating = (maxCount / counts.length).toFixed(2);
            console.log(maxCount);
            console.log(averageRating);

            // Retrieves number of review per star
            const countByStars = [5,4,3,2,1].map(star => {
                return counts.filter(count => count === star).length;
            })

            // Retrieves star with most amount of review
            const highestCount = Math.max(...countByStars);

            // Set the bar based on a percent compare to highest star review amount
            bars.forEach((bar, index) => {
                let count = countByStars[index]
                const percentage = (count / highestCount) * 100;
                bar.style.width = percentage + "%";
                bar.dataset.tooltip = `${count} Ratings`;
            });
            console.log("test");

            console.log(counts)
            document.getElementById("rating-summary-number").textContent = `${averageRating}`
            document.getElementById("rating-summary-total").innerText = `${counts.length} Total reviews`;

            // Loops through all 5 stars
            for (let i = 1; i <= totalStars; i++) {
                const wrapper = document.createElement("span");
                wrapper.classList.add("star-wrapper");

                const emptyStar = document.createElement("i");
                emptyStar.classList.add("fa", "fa-star", "star-empty");

                const fillStar = document.createElement("i");
                fillStar.classList.add("fa", "fa-star", "star-fill");

                // Finds which star needs to be completely filled (100%), semi-filled (1-99%) and empty (0%)
                let numberAVG = Number(averageRating)
                let fillPercent = 0;
                if (numberAVG >= i) {
                    fillPercent = 100;         
                } else if (numberAVG + 1 > i) {
                    fillPercent = (numberAVG - (i - 1)) * 100; 
                }

                // Fills the star according to percent
                fillStar.style.width = `${fillPercent}%`;
                

                wrapper.appendChild(emptyStar);
                wrapper.appendChild(fillStar);
                starContainer.appendChild(wrapper);
            }

            
            document.getElementById("return-arrow").addEventListener("click", () => {
                window.location.href = `../YuWenWork/CustomerHomepage/Assignment.html`;
            });

            document.getElementById("review-button").addEventListener("click", () => {
                window.location.href=`ReviewsComments.html?stall=${encodeURIComponent(stallTitle)}&stallImage=${encodeURIComponent(stallImage)}&stallUnit=${encodeURIComponent(stallUnit)}`
            });

        })
        .catch(error => console.error(error));
});



