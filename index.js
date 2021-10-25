const { default: axios } = require('axios');
const express = require('express');
const cheerio = require('cheerio');

const app = express();

const PORT = process.env.PORT || 3001;
const WANTEDpAGES = 10;

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


	console.log({ lastPage })

	const pages = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15]

	try {

		const promises = pages.map(page => axios.get(`${baseURL}${lastPage - page}`))
		const responses = await Promise.all(promises)

		responses.forEach(response => {

			const html = response.data;
			const $ = cheerio.load(html, { decodeEntities: false });

		// console.log(`Page ${currentPage}: OK`);

			$('li.postbitlegacy').each((idx, item) => {
				const date = $(item).find('.date').text();
				const content = $(item).find('blockquote.postcontent').text();
				const likes = $(item).find('.likes').text();
				const link = 'https://foros.3dgames.com.ar/' + $(item).find('.postcounter').attr('href');

			// const postNumber = linkAndStuff.split('#')[1];
			// const link = `${linkAndStuff.split('?')[0]}/page${currentPage}#post${postNumber}`;

				// console.log(li)
				if (likes > 5) {
					posts.push({ date, content, likes, link });
				}
			});

		})
		console.log('Sending Response');
		res.json(posts);
	}
	catch (e) {
		console.log(e)
	}

});

app.get('/posts', (req, res) => {
	// res.json(posts)
});

app.listen(PORT, () => {
	console.log(`Listening on Port ${PORT}`);
});
