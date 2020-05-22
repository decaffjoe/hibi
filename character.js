"use strict";
const url = "https://graphql.anilist.co", fs = require('fs'), md = require('markdown-it')({ html: true, linkify: true }), MD5 = require('crypto-js/md5'), nodeFetch = require('node-fetch');
// WHAT DOES THIS FILE DO?
// Gets daily show & character info from API and writes to 'public/data.json', that's it!
main().then(data => {
    fs.writeFile('./public/data.json', JSON.stringify(data, null, 2), 'utf-8', (err) => {
        if (err) {
            console.log(err);
            throw err;
        }
        console.log('success');
    });
});
async function main() {
    try {
        // get top 100 shows - API FETCH
        const popShows = await getPopularShows();
        // pick a 'random' show according to today's date
        const targetShowId = selectDateId(popShows);
        // get list of characters from target show - API FETCH
        const targetShow = await getShowCharacters(targetShowId);
        // handle show titles (null or repeats)
        const targetShowNames = showNameValidator(targetShow.title);
        const targetShowChars = targetShow.characters.nodes;
        // pick a 'random' character from target show according to today's date
        const targetCharId = selectDateId(targetShowChars);
        // get character information - API FETCH
        const dailyChar = await getDailyCharacter(targetCharId);
        // handle character description (markdown or null)
        if (dailyChar.description) {
            dailyChar.description = md.render(dailyChar.description);
        }
        else {
            dailyChar.description = '(Oops, I guess this character is too cool to have a description!)';
        }
        // hande character names (null or repeats)
        const dailyCharNames = charNameValidator(dailyChar.name);
        return {
            showTitles: targetShowNames,
            charNames: dailyCharNames,
            character: dailyChar
        };
    }
    catch (err) {
        console.log(err);
    }
}
// Get daily character
async function getDailyCharacter(id) {
    try {
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
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
        // await res.headers.forEach(header => console.log(header));
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
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: `
                query getShowCharacters {
                    Media(id: ${id}) {
                      title {
                        english
                        romaji
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
// Get most popular shows
async function getPopularShows() {
    try {
        let res = await nodeFetch(url, {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: `
        query getPopularShows {
            firstSet: Page(page: 1, perPage: 50) {
              media(sort: POPULARITY_DESC) {
                id
              }
            }
            secondSet: Page(page: 2, perPage: 50) {
              media(sort: POPULARITY_DESC) {
                  id
              }
            }
          }
        `,
            })
        });
        // await res.headers.forEach(header => console.log(header));
        res = await res.json();
        // join the first and second query alias results
        res = [...res.data.firstSet.media, ...res.data.secondSet.media];
        return res;
    }
    catch (err) {
        console.log(err);
        return [];
    }
}
// Pick date-dependent value from array of objects w/ id
function selectDateId(arr) {
    const len = arr.length;
    let d = new Date();
    d = d.toLocaleDateString();
    d = d.split('/').join('');
    // const index = Math.floor(Math.random() * len);
    const index = dateAlgo(d, len);
    return arr[index].id;
}
// Try to get random index within length of array from the current date MMDDYYYY
function dateAlgo(date, arrLen) {
    let hash = MD5(date).words[0];
    return Math.abs(hash) % arrLen;
}
// Avoid printing missing or duplicate show names
function showNameValidator(titles) {
    // get rid of titles that are null or undefined
    let realTitles = {};
    for (let [key, value] of Object.entries(titles)) {
        if (!(value === null || value === undefined)) {
            realTitles[key] = value;
        }
    }
    const japanese = [];
    const results = [];
    if (realTitles.native) {
        // check if native is fully english (or !, ?)
        let regex = /[a-z]|[A-Z]|\?|!/g;
        // get rid of spaces
        let native = realTitles.native.split(' ').join('');
        // get regex match string
        let english = native.match(regex);
        // if native is full english, check alongside english & romaji
        if (english && english.join('') === native) {
            Object.keys(realTitles).forEach(key => results.push(realTitles[key]));
        }
        else {
            japanese.push(realTitles.native);
            Object.keys(realTitles).filter(key => key !== 'native').forEach(key => results.push(realTitles[key]));
        }
    }
    else {
        Object.keys(realTitles).forEach(key => results.push(realTitles[key]));
    }
    // get rid of identical titles
    const deDuped = [];
    results.forEach(x => {
        if (!deDuped.includes(x)) {
            deDuped.push(x);
        }
    });
    // get rid of matching lowercase titles (if a non-lowercase title exists)
    const deLowered = deDuped.filter(x => x !== x.toLowerCase());
    if (deLowered.length > 0) {
        // get rid of matching uppercase titles (if a non-uppercase title exists)
        const deCased = deLowered.filter(x => x !== x.toUpperCase());
        if (deCased.length > 0) {
            return [...deCased, ...japanese];
        }
        return [...deLowered, ...japanese];
    }
    return [...deDuped, ...japanese];
}
function charNameValidator(names) {
    // if native is null or is the same as full
    if (!names.native || names.full === names.native || names.full.toLowerCase() === names.native || names.full.toUpperCase() === names.native) {
        return [names.full];
    }
    return [names.full, names.native];
}
