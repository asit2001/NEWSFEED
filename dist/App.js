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
if (localStorage.getItem("liked")) {
    likedArr = JSON.parse(localStorage.getItem("liked"));
    SavedNewsArr = JSON.parse(localStorage.getItem("savedNews"));
    likedArr.forEach((str, i) => {
        likedMap.set(str, i);
    });
}
renderNewOrOldNews(0);
function renderNewOrOldNews(id) {
    let localNews = localStorage.getItem(newsCategories[id]);
    if (localNews) {
        renderHtml(JSON.parse(localNews));
        loading.style.display = "none";
        news.style.display = "flex";
    }
    else {
        FetchData(id);
    }
}
async function FetchData(id) {
    let url = new URL("https://inshorts.deta.dev/news");
    url.searchParams.set("category", newsCategories[id]);
    news.style.display = "none";
    loading.style.display = "flex";
    try {
        let res = await fetch(url);
        let JsonRes = await res.json();
        renderHtml(JsonRes.data);
        localStorage.setItem(newsCategories[id], JSON.stringify(JsonRes.data));
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
function renderHtml(data) {
    news.innerHTML = "";
    data.forEach(obj => {
        let div = document.createElement("div");
        div.className = "card";
        div.id = obj.id;
        div.innerHTML = `
          <div class="img" style="background-image: url(${obj.imageUrl ? obj.imageUrl : "/img/default.jpg"});"></div>
          <div class="details">
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
              <span class="material-symbols-outlined ${likedMap.has(obj.id) ? "fill" : ""} heart" onclick="likeDisLiked(this)"}> favorite </span>
            </div>
          </div>`;
        news.appendChild(div);
    });
}
function likeDisLiked(el) {
    let card = el.parentElement?.parentElement?.parentElement;
    el.classList.toggle("fill");
    if (likedMap.has(card.id)) {
        likedMap.delete(card.id);
        likedArr.splice(likedMap.get(card.id), 1);
        SavedNewsArr.splice(likedMap.get(card.id), 1);
    }
    else {
        likedMap.set(card.id, likedArr.length);
        likedMap.set(card.id, likedArr.length);
        likedArr.push(card.id);
        SavedNewsArr.push({ id: card.id, html: card.innerHTML.trim() });
        console.log(card);
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
        renderNewOrOldNews(Number(li.id));
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
    news.innerHTML = "";
    SavedNewsArr.forEach((obj) => {
        let div = document.createElement("div");
        div.className = "card";
        div.id = obj.id;
        div.innerHTML = obj.html;
        news.appendChild(div);
    });
});
