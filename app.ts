const tooltip = "UwwwuuUu it's " + new Date().toLocaleTimeString(),
    char = {},
    url = "https://graphql.anilist.co",
    charH1 = document.querySelector('#header h1'),
    charH3 = document.querySelector('#header h3'),
    charImage = document.querySelector('#charDay div#photo'),
    charH2 = document.querySelector('#charDay h2'),
    charDesc = document.querySelector('#charDay div#description'),
    charTitles = document.querySelector('#charDay ul'),
    md = window.markdownit({ html: true, linkify: true });


// Fluff for the headers
charH1.title = tooltip;
charH3.textContent = new Date().toDateString();

// DAILY CHARACTER
main();

async function main() {
    try {
        const popShows = await getPopularShows();
        const targetShowId = await selectDateId(popShows);

        const targetShow = await getShowCharacters(targetShowId);

        const targetShowNames = showNameValidator(targetShow.title);
        // Populate show titles on page (up to 3 unique titles from { romaji, english, native })
        for (let i = 0; i < 3; ++i) {
            charTitles.children[i].textContent = targetShowNames[i];
        }

        const targetShowChars = targetShow.characters.nodes;
        const targetCharId = await selectDateId(targetShowChars);

        const dailyChar = await getDailyCharacter(targetCharId);
        charImage.style.backgroundImage = `url("${dailyChar.image.large}")`;
        charH2.textContent = dailyChar.name.full;
        charDesc.innerHTML = md.render(dailyChar.description);
    } catch (err) {
        console.log(err);
    }
}

// Get daily character
async function getDailyCharacter(id: number): Promise<dailyCharacter> {
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
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Get target show information
async function getShowCharacters(id: number): Promise<showCharacters> {
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
    } catch (err) {
        console.log(err);
        return err;
    }
}

// Get most popular shows
async function getPopularShows(): Promise<popularShows[]> {
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
        res = await res.json();
        // join the first and second query alias results
        res = [...res.data.firstSet.media, ...res.data.secondSet.media];
        return res;
    } catch (err) {
        console.log(err);
        return [];
    }
}

// Pick date-dependent value from array of objects w/ id
function selectDateId(arr: any[]): number {
    const len = arr.length;

    let d: any = new Date();
    d = d.toLocaleDateString();
    d = d.split('/').join('');

    const index = Math.floor(Math.random() * len);
    // const index = dateAlgo(d, len);

    return arr[index].id;
}

// Try to get random index within length of array from the current date MMDDYYYY
function dateAlgo(date: string, arrLen: number): number {
    let hash = 0;
    if (date.length == 0) {
        return hash;
    }
    for (let i = 0; i < date.length; i++) {
        let char = date.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % arrLen;
}

// Avoid printing missing or duplicate show names
function showNameValidator(titles: showTitles): string[] {

    // get rid of titles that are null or undefined
    let realTitles: { [key: string]: string } = {};
    for (let [key, value] of Object.entries(titles)) {
        if (!(value === null || value === undefined)) {
            realTitles[key] = value;
        }
    }

    // check if native is fully japanese
    const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const native = realTitles.native.split('');
    let fulljapanese = true;
    native.forEach(letter => {
        if (alphabet.includes(letter)) {
            return fulljapanese = false;
        }
    });

    const japanese: string[] = [];
    const results: string[] = [];

    // if native is japanese, only proceed with checks on english & romaji
    if (fulljapanese) {
        japanese.push(realTitles.native);
        Object.keys(realTitles).filter(key => key !== 'native').forEach(key => results.push(realTitles[key]));
    } else {
        Object.keys(realTitles).forEach(key => results.push(realTitles[key]));
    }

    // get rid of identical titles
    const deDuped: string[] = [];
    results.forEach(x => {
        if (!deDuped.includes(x)) {
            deDuped.push(x)
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

// match getShowNames fetch query
interface popularShows {
    id: number
}

interface showTitles {
    english: string | null,
    romaji: string | null,
    native: string | null,
}

interface showCharacters {
    title: {
        english: string | null,
        romaji: string | null,
        native: string | null,
    },
    characters: {
        nodes: [
            {
                id: number
            }
        ]
    }
}

interface dailyCharacter {
    name: {
        first: string,
        last: string,
        full: string,
        native: string
    },
    description: string,
    image: {
        large: string,
        medium: string
    }
}

// Create random rgb color and apply to property 'field' of event target's style
function randRGBEventStyler(e: Event, field: string): void {
    let rand = [1, 1, 1];
    rand = rand.map(x => Math.random() * 255);
    let bgRand = `rgb(${rand[0]}, ${rand[1]}, ${rand[2]})`;
    e.target.style = `${field}: ${bgRand};`;
};