import Vue from "https://cdn.jsdelivr.net/npm/vue@2.6.11/dist/vue.esm.browser.js";
const app = new Vue({
    el: '#app',
    data: {
        message: 'anime shows',
        tooltip: "UwwwuuUu it's " + new Date().toLocaleTimeString(),
        shows: [],
    },
    created() {
        fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                query: `
                query getShowNames { 
                    Page (page: 1, perPage: 10) {
                        media (search: "dragon") {
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
    },
});
