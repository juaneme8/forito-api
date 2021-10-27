const axios = require('axios');
const express = require('express');
const cheerio = require('cheerio');

const app = express();

const PORT = process.env.PORT || 3001;

// const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina?goto=newpost'
const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina/page';


const getLastPage = async () => {
	try {
		const response = await axios.get(`${baseURL}12648`);
		const html = response.data;

		const $ = cheerio.load(html, { decodeEntities: false });

		const lastPageLink = $('.first_last').last().find('a').attr('href');

		return lastPageLink.split('page')[1].split('?')[0];
	} catch (error) {
		console.error(error);
	}
};


// \n\t\t\t\n\t\t\n\t\n

app.get('/', async (req, res) => {
	const posts = [];
	const lastPage = await getLastPage();

	const { pages, likes } = req.query;

	const wantedPages = pages ? parseInt(pages) : 10;
	const wantedLikes = likes ? parseInt(likes) : 0;

	console.log(`${wantedPages}/${wantedLikes}/${lastPage}`);

	let pagesArr = [];
	for (let i = 0; i < wantedPages; i++) pagesArr.push(i);

	try {
		const promises = pagesArr.map(page => axios.request({
			method: 'GET', url: `${baseURL}${lastPage - page}`,
			responseType: 'arraybuffer',
			reponseEncoding: 'binary'
		}));
		const responses = await Promise.all(promises);

		responses.forEach((response, index) => {
			console.log({ index });

			const html = response.data.toString('latin1');

			// console.log(html)
			// const $ = cheerio.load(html, { decodeEntities: false });
			const $ = cheerio.load(html);

			// console.log($.html())

			// console.log(`Page ${currentPage}: OK`);

			$('li.postbitlegacy').each((idx, item) => {
				const date = $(item).find('.date').text();
				const content = $(item).find('blockquote.postcontent').text().trim();
				const likes = parseInt($(item).find('.likes').text());
				const postCounter = $(item).find('.postcounter').text().slice(1);
				const link = 'https://foros.3dgames.com.ar/' + $(item).find('.postcounter').attr('href');

				// const postNumber = linkAndStuff.split('#')[1];
				// const link = `${linkAndStuff.split('?')[0]}/page${currentPage}#post${postNumber}`;

				if (likes > wantedLikes) {
					posts.push({ date, content, likes, link, postCounter });
				}

			});
		});
		posts.sort(function (a, b) {
			return b.postCounter - a.postCounter;
		});

		console.log('Sending Response');
		res.json(posts);
	} catch (e) {
		console.log(e);
	}
});

app.get('/posts', (req, res) => {
	// res.json(posts)
});

app.listen(PORT, () => {
	console.log(`Listening on Port ${PORT}`);
});
