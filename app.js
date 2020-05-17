"use strict";
const tooltip = "UwwwuuUu it's " + new Date().toLocaleTimeString(), char = {}, url = "https://graphql.anilist.co", body = document.body, charImage = document.querySelector('#charDay div'), charH1 = document.querySelector('#charDay h1'), charH2 = document.querySelector('#charDay h2'), charP = document.querySelector('#charDay p'), charTitles = document.querySelector('#charDay ul'), inputSearch = document.querySelector('input'), showResults = document.querySelector('#show-results');
// Tooltip for character of the day header
charH1.title = tooltip;
// DAILY CHARACTER
main();
async function main() {
    try {
        const popShows = await getPopularShows();
        const targetShowId = await pickRandomId(popShows);
        const targetShow = await getShowCharacters(targetShowId);
        const targetShowNames = [];
        for (let key in targetShow.title) {
            targetShowNames.push(targetShow.title[key]);
        }
        let childLen = charTitles.children.length;
        for (let i = 0; i < childLen; ++i) {
            charTitles.children[i].textContent = targetShowNames[i];
        }
        const targetShowChars = targetShow.characters.nodes;
        const targetCharId = await pickRandomId(targetShowChars);
        const dailyChar = await getDailyCharacter(targetCharId);
        charImage.style.backgroundImage = `url("${dailyChar.image.large}")`;
        charH2.textContent = dailyChar.name.full;
        charP.innerHTML = dailyChar.description;
    }
    catch (err) {
        console.log(err);
    }
}
// Get daily character
async function getDailyCharacter(id) {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
                query getDailyCharacter {
                    Character(id: ${id}) {
                      name {
                        first
                        last
                        full
                        native
                      }
                      description
                      image {
                        large
                        medium
                      }
                    }
                }
                `,
            })
        });
        res = await res.json();
        res = res.data.Character;
        return res;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Get target show information
async function getShowCharacters(id) {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
                query getShowCharacters {
                    Media(id: ${id}) {
                      title {
                        romaji
                        english
                        native
                      }
                      characters(sort: FAVOURITES_DESC) {
                        nodes {
                          id
                        }
                      }
                    }
                  }
                `,
            })
        });
        res = await res.json();
        res = res.data.Media;
        return res;
    }
    catch (err) {
        console.log(err);
        return err;
    }
}
// Pick random value from array of objects w/ id
function pickRandomId(arr) {
    const len = arr.length;
    const index = Math.floor(Math.random() * len);
    return arr[index].id;
}
// Get most popular shows
async function getPopularShows() {
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                // match ShowData type
                query: `
        query getPopularShows {
            first50: Page(page: 1, perPage: 50) {
              media(sort: POPULARITY_DESC) {
                id
              }
            }
          }
        `,
            })
        });
        res = await res.json();
        res = res.data.first50.media;
        return res;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}
// Create random rgb color and apply to property 'field' of event target's style
function randRGBEventStyler(e, field) {
    let rand = [1, 1, 1];
    rand = rand.map(x => Math.random() * 255);
    let bgRand = `rgb(${rand[0]}, ${rand[1]}, ${rand[2]})`;
    e.target.style = `${field}: ${bgRand};`;
}
;
