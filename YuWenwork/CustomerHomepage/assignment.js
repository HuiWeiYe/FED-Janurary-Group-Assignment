// Used on assignment.html to navigate to stalls.html with a cuisine type 
function goToCuisine(cuisineType){
    window.location.href = `stalls.html?type=${encodeURIComponent(cuisineType)}`;
}
// Used on stalls.html to load stalls based on cuisine type 
document.addEventListener('DOMContentLoaded', function(){
    const activeStalls =  [
    "Spicy & Numb (Mala HotPot)", 
    "King of Noodle (Noodle)", 
    "Tteoboki Heaven",
    "Western Delights"
    ];

   const Restaurant = {
    "Chinese": [
        {unit: "#1-07", name: "Spicy & Numb (Mala HotPot)", link:"Spicy&Numb.html",image: "https://tse3.mm.bing.net/th/id/OIP.zPLc-Bzj1cev4nPhrbYpMgHaGR?rs=1&pid=ImgDetMain&o=7&rm=3"},  
        {unit: "#2-03", name: "Fried Rice King", link: "#", image:"https://sethlui.com/wp-content/uploads/2023/10/Storefront2-800x531.jpg"}, 
        {unit: "#3-03", name: "King of Noodle (Noodle)", link:"KingOfNoodle.html", image: "https://www.stall.sg/upload/202310061225195160.jpg"}, 
    ],
    "Noodle": [
        {unit: "#3-03", name: "King of Noodle (Noodle)", link:"KingOfNoodle.html", image: "https://www.stall.sg/upload/202310061225195160.jpg"}, 
    ],
    "Mala HotPot": [
        {unit: "#1-07", name: "Spicy & Numb (Mala HotPot)", link:"Spicy&Numb.html", image: "https://tse3.mm.bing.net/th/id/OIP.zPLc-Bzj1cev4nPhrbYpMgHaGR?rs=1&pid=ImgDetMain&o=7&rm=3"} 
    ],
    "Korean": [
        {unit: "#1-09", name: "Tteoboki Heaven", link: "tteobokiHeaven.html", image: "https://s3-ap-southeast-1.amazonaws.com/motoristprod/editors/images/1669346859389-jeongsjjajang13.jpg"}, 
        {unit: "#2-05", name: "Korean Fried Chicken", link: "#", image: "https://sethlui.com/wp-content/uploads/2022/04/storefront-5-921x840.jpg"},
    ],
    "Western": [
        {unit: "#1-03", name: "Western Delights", link: "WesternDelights.html", image: "https://danielfooddiary.com/wp-content/uploads/2018/02/marketstreet26.jpg"}, 
        {unit: "#2-09", name: "John's Steak House", link: "#", image:"https://mustsharenews.com/wp-content/uploads/2021/01/rasa-sayang-western-food-amk-4.jpg"},
        {unit: "#3-07", name: "Family Western", link: "#", image: "https://danielfooddiary.com/wp-content/uploads/2019/07/marineparade32.jpg"},
    ],
};
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
    if(!titleElement || !list) return;

// 3. If the cuisine exists in our data, build the list 
    if (cuisineType && Restaurant[cuisineType]){
        // Update the <h1> to say "Chinese Cuisine" or "Cuisine" 
        titleElement.innerText = cuisineType + " Cuisine";
        const stores = Restaurant[cuisineType];
        // Clear the list first (js in case) 
        list.innerHTML = "";
        // 4. Loop through the stores and create HTML
        stores.forEach((store) => {
            // Check if there is a real link, not just "#"
            const hasPage = store.link != "#";

            list.innerHTML += `
                <a href="${store.link}" class="stall-card${hasPage ? '' : ' disabled'}">
                   <div class ="image-box">
                    <img src="${store.image}" alt="${store.name}" class="store-img">
                   </div>
                   <div class ="store-info">
                       <h2 class="store-name">${store.name}</h2>
                       <p class="store-desc">
                           Unit-No: ${store.unit}
                        </p>
                    </div>
                </a>
            `;
        })
    }
    else{
        titleElement.innerText = "Cuisine not found";
        list.innerHTML = "<p>No Stalls found in this category.</p>";
    }

});