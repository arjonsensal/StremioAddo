const needle = require('needle')
const fetchImdbItems = require('./fetch-imdb-links')

const getItems = async() => {
	try {
		// console.log('Found items:');
		const items = await fetchImdbItems();
		const requests = items.map(item => needle('get', 'https://v3-cinemeta.strem.io/meta/' + item.type + '/' + item.id + '.json'));
		const responses = await Promise.all(requests)
		const metaPromises = responses.map((response, index) => {
			if (response.statusCode === 200) {
				// console.log(`Data from ${items[index].id}:`, response.body.meta);
				const meta = response.body.meta;
        const url = `https://api.themoviedb.org/3/find/${items[index].id}?external_source=imdb_id`;
        const options = {
          method: 'GET',
          headers: {
            accept: 'application/json',
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJkYjVmNjE2Y2YwYTAxMzdhNjc0ZDA0NmJlZjNmMjQzMyIsIm5iZiI6MTc1Mjk1ODczMi4xMzc5OTk4LCJzdWIiOiI2ODdjMDcwYzE4YmY0ZTI1Mzg4YTQ1NmMiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.f6ZNRQ8BC9MhqwYPe3tDUGbFeubqS29HiGCxLoERk58'
          }
        };
        return needle('get', url, options)
          .then(fetchPosters => {
            const data = (items[index].type === 'movie') ? fetchPosters.body.movie_results[0] : fetchPosters.body.tv_results[0];
            meta.background = `https://image.tmdb.org/t/p/original${data.backdrop_path}`;
            meta.poster = `https://image.tmdb.org/t/p/original${data.poster_path}`;
            return response.body.meta;
          });
			} else {
				console.error(`Error fetching ${items[index].id}: Status Code ${response.statusCode}`);
				return Promise.resolve(null);
			}
		});
		const metaArray = (await Promise.all(metaPromises)).filter(meta => meta !== null);
		return metaArray;
	} catch (error) {
		console.error('Failed to fetch items:', error);
		return [];
	}
}

module.exports = getItems
