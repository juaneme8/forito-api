const { default: axios } = require('axios');
const express = require('express');
const cheerio = require('cheerio');

const app = express();

const PORT = 3001;

const posts = []
// const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina?goto=newpost'
const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina/page'


const getLastPage = async () => {
    try {
        const response = await axios.get(`${baseURL}12648`)
        const html = response.data;
        const $ = cheerio.load(html, { decodeEntities: false });

        const lastPageLink = $('.first_last').last().find("a").attr('href');

        // console.log(lastPageLink)

        return lastPageLink.split("page")[1].split('?')[0]

    }
    catch (error) {
        console.error(error)
    }
}







app.get('/', async (req, res) => {
    const lastPage = await getLastPage()
    // console.log(lastPage)

    for (let page = lastPage - 5; page = lastPage; page++) {
        axios.get(`${baseURL}${lastPage}`)
            .then(response => {
                console.log('page',page)

                const html = response.data;
                const $ = cheerio.load(html, { decodeEntities: false });

                $("li.postbitlegacy").each((idx, item) => {


                    const date = $(item).find('.date').text()
                    const content = $(item).find('blockquote.postcontent').text()
                    const likes = $(item).find('.likes').text()
                    const link = 'https://foros.3dgames.com.ar/' + $(item).find('.postcounter').attr('href')

                    // console.log(likes)
                    if (likes > 0) {
                        posts.push({ page, date, content, likes, link })
                    }
                })


            })
    }
    res.json(posts)

})

app.get('/posts', (req, res) => {

    // res.json(posts)

})

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`)
});