"use strict";
const navList = document.getElementById("nav-list");
const menu = document.querySelector(".menu");
const loading = document.querySelector(".loading");
const news = document.querySelector(".news");
const categoryName = document.getElementById("category-name");
const NewNews = document.getElementById("NewNews");
const savedNews = document.getElementById("savedNews");
const newsCategories = [
    "all",
    "national",
    "business",
    "sports",
    "world",
    "politics",
    "technology",
    "startup",
    "entertainment",
    "miscellaneous",
    "hatke",
    "science",
    "automobile"
];
let likedMap = new Map();
let likedArr = [];
let SavedNewsArr = [];
let fetchedData = [];
if (localStorage.getItem("liked")) {
    likedArr = JSON.parse(localStorage.getItem("liked"));
    SavedNewsArr = JSON.parse(localStorage.getItem("savedNews"));
    likedArr.forEach((str, i) => {
        likedMap.set(str, i);
    });
}
FetchData(0);
async function FetchData(id) {
    let url = new URL("https://inshorts.deta.dev/news");
    url.searchParams.set("category", newsCategories[id]);
    news.style.display = "none";
    loading.style.display = "flex";
    try {
        let res = await fetch(url);
        let JsonRes = await res.json();
        fetchedData = JsonRes.data;
        renderHtml(JsonRes.data, newsCategories[id]);
    }
    catch (error) {
        alert("Something going wrong on backend");
        console.log(error);
    }
    finally {
        loading.style.display = "none";
        news.style.display = "flex";
    }
}
function renderHtml(data, category) {
    news.innerHTML = "";
    data.forEach((obj, i) => {
        if (category != "") {
            obj.category = category;
        }
        let div = document.createElement("div");
        div.className = "card";
        div.id = obj.id;
        div.innerHTML = `
        <div class="img" style="background-image: url(${obj.imageUrl ? obj.imageUrl : "/img/default.jpg"});"></div>
        <div class="details">
            <p class="category">category <span>${obj.category}</span></p>
            <h2 class="title">
              ${obj.title}
            </h2>
            <p>Short by ${obj.author} / ${obj.time} on ${obj.date}</p>
            <p class="content">
            ${obj.content}
            </p>
            <div class="btn-icons">
              <a href="${obj.readMoreUrl}" class="more"
                >Read More<span class="material-symbols-outlined">
                  chevron_right
                </span></a
              >
              <span class="material-symbols-outlined ${likedMap.has(obj.title) ? "fill" : ""} heart" onclick="likeDisLiked(this,${i})"}> favorite </span>
            </div>
          </div>`;
        news.appendChild(div);
    });
}
function likeDisLiked(el, i) {
    let card = el.parentElement?.parentElement?.parentElement;
    el.classList.toggle("fill");
    if (likedMap.has(card.querySelector(".title").textContent.trim())) {
        likedMap.delete(card.querySelector(".title").textContent.trim());
        likedArr.splice(likedMap.get(card.querySelector(".title").textContent.trim()), 1);
        SavedNewsArr.splice(likedMap.get(card.querySelector(".title").textContent.trim()), 1);
    }
    else {
        likedMap.set(card.querySelector(".title").textContent.trim(), likedArr.length);
        likedMap.set(card.querySelector(".title").textContent.trim(), likedArr.length);
        likedArr.push(card.querySelector(".title").textContent.trim());
        SavedNewsArr.push({ id: card.querySelector(".title").textContent.trim(), obj: fetchedData[i] });
        console.log();
    }
    localStorage.setItem("liked", JSON.stringify(likedArr));
    localStorage.setItem("savedNews", JSON.stringify(SavedNewsArr));
}
document.querySelectorAll(".nav-list-item").forEach(li => {
    li.addEventListener("click", () => {
        if (li.classList.contains("active"))
            return;
        document.querySelector(".active")?.classList.remove("active");
        li.classList.add("active");
        categoryName.textContent = `Category : ${newsCategories[Number(li.id)]}`;
        FetchData(Number(li.id));
    });
});
NewNews.addEventListener("click", e => {
    e.preventDefault();
    let id = document.querySelector(".active").id;
    FetchData(Number(id));
    console.log(id);
});
savedNews.addEventListener("click", () => {
    categoryName.textContent = "Saved News";
    document.querySelector(".active")?.classList.remove("active");
    let temp = [];
    SavedNewsArr.forEach(obj => {
        temp.push(obj.obj);
    });
    renderHtml(temp, "");
});
