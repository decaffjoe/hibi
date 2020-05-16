"use strict";
const tooltip = "UwwwuuUu it's " + new Date().toLocaleTimeString(), char = {}, url = "https://graphql.anilist.co", body = document.body, titleAnime = document.querySelector('h1#anime'), inputSearch = document.querySelector('input'), showResults = document.querySelector('#show-results');
titleAnime.title = tooltip;
inputSearch?.addEventListener('keyup', getShowNames);
async function getShowNames(e) {
    let search = e.target.value, shows = [];
    if (search.length > 0) {
        await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: `
                query getShowNames { 
                    Page (page: 1, perPage: 6) {
                        media (search: "${search}") {
                            id 
                            title {
                                romaji 
                            } 
                        } 
                    }
                }
                `,
            })
        })
            .then(res => res.json())
            .then(data => data.data.Page.media)
            .then(data => shows = data)
            .catch(err => console.log(err));
    }
    else {
        shows = [];
    }
    await showShowNames(shows);
    colorFader(e, 'background-color');
}
;
async function showShowNames(shows) {
    while (showResults?.firstChild) {
        showResults.removeChild(showResults.lastChild);
    }
    ;
    if (shows.length > 0) {
        await shows.forEach(show => {
            let el = document.createElement('li');
            el.textContent = show.title.romaji;
            showResults?.appendChild(el);
        });
    }
}
;
function colorFader(e, field) {
    let rand = [1, 1, 1];
    rand = rand.map(x => Math.random() * 255);
    let bgRand = `rgb(${rand[0]}, ${rand[1]}, ${rand[2]})`;
    e.target.style = `${field}: ${bgRand};`;
}
;
