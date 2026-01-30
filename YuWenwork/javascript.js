const activeStalls =  [
    "Spicy & Numb (Mala HotPot)", 
    "King of Noodle (Noodle)", 
    "Tteoboki Heaven",
    "Western Delights"
];
const Restaurant = {
    "Chinese": [
        {unit: "1-07", name: "Spicy & Numb (Mala HotPot)", link:"Spicy&Numm.html"},  
        {unit: "2-03", name: "Fried Rice King", link: "#"}, 
        {unit: "3-03", name: "King of Noodle (Noodle)", link:"KingOfNoodle.html"}, 
    ],
    "Noodle": [
        {unit: "3-03", name: "King of Noodle (Noodle)", link:"KingOfNoodle.html"}, 
    ],
    "Mala HotPot": [
        {unit: "1-07", name: "Spicy & Numb (Mala HotPot)", link:"Spicy&Numm.html"} 
    ],
    "Korean": [
        {unit: "1-09", name: "Tteoboki Heaven", link: "tteobokiHeaven.html"}, 
        {unit: "2-05", name: "Korean Fried Chicken", link: "#"},
    ],
    "Western": [
        {unit: "1-03", name: "Western Delights", link: "WesternDelights.html"}, 
        {unit: "2-09", name: "John's Steak House", link: "#"},
        {unit: "3-07", name: "Family Western", link: "#"},
    ],
};

document.addEventListener('DOMContentLoaded', function(){
    // 1. Looking at the URL 
    //Get the full address bar details: 
    const addrBar = window.location;
    //Get just the part after the '?' (e.g. "?type=Chinese"): 
    const queryString = addrBar.search;
    //Create the tool to read that string: 
    const urlTool = new URLSearchParams(queryString);
    //Finally, get the specific value: 
    const cuisineType = urlTool.get('type')

// 2. Grab elements from HTML 
    const titleElement = document.getElementById('cuisine-title');
    const list = document.getElementById('stall-list-page')

// 3. If the cuisine exists in our data, build the list 
    if (cuisineType && Restaurant[cuisineType]){
        // Update the <h1> to say "Chinese Cuisine" or "Cuisine" 
        titleElement.innerText = cuisineType + " Cuisine";
        const stores = Restaurant[cuisineType];
        // Clear the list first (js in case) 
        list.innerHTML = "";
        // 4. Loop through the sotres and create HTML
        stores.forEach((store) => {
            // Check if there is a real link, not just "#"
            const hasPage = store.link != "#";

            list.innerHTML += `
                <a href="${store.link}" class="stall-card${hasPage ? '' : ' disabled'}">
                    <div><strong>${store.name}</strong></div>
                    <div>Unit: ${store.unit}</div>
                </a>
            `;
        })
    }

});
