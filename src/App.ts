const navList = document.getElementById("nav-list")! as HTMLUListElement;
const menu = document.querySelector(".menu")! as HTMLSpanElement;
const loading = document.querySelector(".loading")! as HTMLDivElement;
const news = document.querySelector(".news")! as HTMLDivElement;
const categoryName = document.getElementById("category-name")! as HTMLHeadingElement;
const NewNews = document.getElementById("NewNews")! as HTMLButtonElement;
const savedNews = document.getElementById("savedNews")! as HTMLButtonElement;
interface Res {
    category: string,
    data: data[]
}
interface data {
    author: string,
    content: string,
    date: string,
    id: string,
    imageUrl: string,
    readMoreUrl: string,
    time: string,
    title: string,
    url: string
}
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
    "automobile"];

let likedMap = new Map<string, number>();
let likedArr: string[] = [];
let SavedNewsArr: {id:string,html:string}[] = [];


if (localStorage.getItem("liked")) {
    likedArr = JSON.parse(localStorage.getItem("liked")!);
    SavedNewsArr = JSON.parse(localStorage.getItem("savedNews")!);
    likedArr.forEach((str, i) => {
        likedMap.set(str, i);
    })
}
renderNewOrOldNews(0);

function renderNewOrOldNews(id: number) {
    let localNews = localStorage.getItem(newsCategories[id]);
    if (localNews) {
        renderHtml(JSON.parse(localNews) as data[]);
        loading.style.display = "none";
        news.style.display = "flex";
    } else {
        FetchData(id);
    }
}
async function FetchData(id: number) {
    let url = new URL("https://inshorts.deta.dev/news");
    url.searchParams.set("category", newsCategories[id]);
    news.style.display = "none";
    loading.style.display = "flex";
    try {
        let res = await fetch(url);
        let JsonRes: Res = await res.json();
        renderHtml(JsonRes.data);
        localStorage.setItem(newsCategories[id], JSON.stringify(JsonRes.data));
    } catch (error) {
        alert("Something going wrong on backend");
        console.log(error);

    } finally {
        loading.style.display = "none";
        news.style.display = "flex";
    }
}
function renderHtml(data: data[]) {
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
          </div>`
        news.appendChild(div);
    })
}

function likeDisLiked(el: HTMLSpanElement) {
    let card = el.parentElement?.parentElement?.parentElement!;
    el.classList.toggle("fill");
    if (likedMap.has(card.id)) {
        likedMap.delete(card.id);
        likedArr.splice(likedMap.get(card.id)!, 1)
        SavedNewsArr.splice(likedMap.get(card.id)!, 1)
    } else {
        likedMap.set(card.id, likedArr.length);
        likedMap.set(card.id, likedArr.length);
        likedArr.push(card.id);
        SavedNewsArr.push({id:card.id, html:card.innerHTML.trim()});
        console.log(card);
        
    }
    localStorage.setItem("liked", JSON.stringify(likedArr));
    localStorage.setItem("savedNews", JSON.stringify(SavedNewsArr));

}
document.querySelectorAll<HTMLLIElement>(".nav-list-item").forEach(li => {
    li.addEventListener("click", () => {
        if (li.classList.contains("active")) return;
        document.querySelector(".active")?.classList.remove("active");
        li.classList.add("active");
        categoryName.textContent = `Category : ${newsCategories[Number(li.id)]}`
        renderNewOrOldNews(Number(li.id));
    })
});

NewNews.addEventListener("click", e => {
    e.preventDefault();
    let id = document.querySelector(".active")!.id
    FetchData(Number(id));
    console.log(id);

});
savedNews.addEventListener("click",()=>{
    categoryName.textContent = "Saved News"
    document.querySelector(".active")?.classList.remove("active");
    news.innerHTML = "";
    SavedNewsArr.forEach((obj)=>{
        let div = document.createElement("div");
        div.className = "card";
        div.id = obj.id;
        div.innerHTML = obj.html;
        news.appendChild(div);
    })
})