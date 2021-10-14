const { default: axios } = require('axios');
const express = require('express');
const cheerio = require('cheerio');

const app = express();

const PORT = 3001;
const WANTEDpAGES = 2;
const posts = [];
// const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina?goto=newpost'
const baseURL = 'https://foros.3dgames.com.ar/threads/942062-ofertas-online-argentina/page';

const getLastPage = async () => {
	try {
		const response = await axios.get(`${baseURL}12648`);
		const html = response.data;
		const $ = cheerio.load(html, { decodeEntities: false });

		const lastPageLink = $('.first_last').last().find('a').attr('href');

		// console.log(lastPageLink)

		return lastPageLink.split('page')[1].split('?')[0];
	} catch (error) {
		console.error(error);
	}
};

// [result1, result2] = Promise.all([async1(), async2()]);

app.get('/', async (req, res) => {
	const lastPage = await getLastPage();

	console.log('Starting');
	for (let i = 0; i < WANTEDpAGES; i++) {
		const currentPage = lastPage - i;
		// console.log({ currentPage });
		console.log(`Loading Page ${currentPage}...`);
		await axios.get(`${baseURL}${currentPage}`).then(response => {
			const html = response.data;
			const $ = cheerio.load(html, { decodeEntities: false });

			console.log(`Page ${currentPage}: OK`);

			$('li.postbitlegacy').each((idx, item) => {
				const date = $(item).find('.date').text();
				const content = $(item).find('blockquote.postcontent').text();
				const likes = $(item).find('.likes').text();
				const link = 'https://foros.3dgames.com.ar/' + $(item).find('.postcounter').attr('href');

				// const postNumber = linkAndStuff.split('#')[1];
				// const link = `${linkAndStuff.split('?')[0]}/page${currentPage}#post${postNumber}`;

				// console.log(li)
				if (likes > 1) {
					posts.push({ currentPage, date, content, likes, link });
				}
			});
		});
	}
	console.log('Sending Response');
	res.json(posts);
});

app.get('/posts', (req, res) => {
	// res.json(posts)
});

app.listen(PORT, () => {
	console.log(`Listening on Port ${PORT}`);
});
