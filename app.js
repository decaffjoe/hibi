import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.js";
const app = new Vue({
    el: '#app',
    data: {
        tooltip: "UwwwuuUu it's " + new Date().toLocaleTimeString(),
        char: {},
        url: "https://graphql.anilist.co",
        search: '',
        shows: [],
    },
    methods: {
        getShowNames() {
            if (this.search.length > 0) {
                fetch(this.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        query: `
                query getShowNames { 
                    Page (page: 1, perPage: 6) {
                        media (search: "${this.search}") {
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
                    .then(data => this.shows = data)
                    .catch(err => console.log(err));
            }
            else {
                return this.shows = [];
            }
        },
        colorFader(e, field) {
            let rand = [1, 1, 1];
            rand = rand.map(x => Math.random() * 255);
            let bgRand = `rgb(${rand[0]}, ${rand[1]}, ${rand[2]})`;
            e.target.style = `${field}: ${bgRand};`;
        }
    },
});
