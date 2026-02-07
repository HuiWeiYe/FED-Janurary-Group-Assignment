// Loading rating bars
document.addEventListener("DOMContentLoaded", () => {
    
    const bars = document.querySelectorAll(".bar-fill");
    const starContainer = document.getElementById("rating-summary-stars");
    starContainer.innerHTML = "";
    const totalStars = 5;
    fetch("CustomerSample.json")
        .then(response => response.json())
        .then(data => {
            console.log(data);
            console.log(data.customers[0].customerName);

            const counts = data.customers.flatMap(customer => 
                customer.reviews
                    .filter(review => review.stall === "Wok Noodles") // Change stall here
                    .map(review => review.rating));
            const maxCount = counts.reduce((total, current) => total + current, 0);
            const averageRating = (maxCount / counts.length).toFixed(2);
            console.log(`Overall total stars: ${maxCount}`);
            console.log(`Overall average stars: ${averageRating}`);

            const countByStars = [5,4,3,2,1].map(star => {
                return counts.filter(count => count === star).length;
            })

            const highestCount = Math.max(...countByStars);
            console.log(`All Stars: ${counts}`)
            console.log(`All Stars Total: ${countByStars}`)
            console.log(`Highest Star: ${highestCount}`)

            bars.forEach((bar, index) => {
                count = countByStars[index]
                const percentage = (count / highestCount) * 100;
                bar.style.width = percentage + "%";
                bar.dataset.tooltip = `${count} Ratings`;
            });

            
            const totalReviews = counts.reduce((a, b) => a + b, 0);
            document.getElementById("rating-summary-number").textContent = `${averageRating}`
            document.getElementById("rating-summary-total").innerText = `${totalReviews} Total reviews`;

            for (let i = 1; i <= totalStars; i++) {
                const wrapper = document.createElement("span");
                wrapper.classList.add("star-wrapper");

                const emptyStar = document.createElement("i");
                emptyStar.classList.add("fa", "fa-star", "star-empty");

                const fillStar = document.createElement("i");
                fillStar.classList.add("fa", "fa-star", "star-fill");

                let numberAVG = Number(averageRating)
                let fillPercent = 0;
                if (numberAVG >= i) {
                    fillPercent = 100;         
                } else if (numberAVG + 1 > i) {
                    fillPercent = (numberAVG - (i - 1)) * 100; 
                }

                fillStar.style.width = `${fillPercent}%`;
                

                wrapper.appendChild(emptyStar);
                wrapper.appendChild(fillStar);
                starContainer.appendChild(wrapper);
            }


        })
        .catch(error => console.error(error));
});