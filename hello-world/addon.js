const { addonBuilder } = require("stremio-addon-sdk")
var needle = require('needle')
const fetchImdbItems = require('./fetch-imdb-links')

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.OurWatchlist",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "top"
		}
	],
	"resources": [
		"catalog"
	],
	"types": [
		"movie",
		"series"
	],
	"name": "OurWatchlist",
	"description": "Our Watchlist",
	"idPrefixes": [
		"tt"
	]
}
const builder = new addonBuilder(manifest)

const getItems = async() => {
	try {
		const items = await fetchImdbItems();
		console.log('Found items:');
		items.forEach(item => console.log(`ID: ${item.id}, Type: ${item.type}`));
		const requests = items.map(item => needle('get', 'https://v3-cinemeta.strem.io/meta/' + item.type + '/' + item.id + '.json'));
		const responses = await Promise.all(requests)
		responses.forEach((response, index) => {
				if (response.statusCode === 200) {
					console.log(`Data from ${urls[index]}:`, response.body.meta);
				} else {
					console.error(`Error fetching ${urls[index]}: Status Code ${response.statusCode}`);
				}
			});
	} catch (error) {
		console.error('Failed to fetch items:', error);
	}
}

builder.defineCatalogHandler(({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id)
	return Promise.resolve(getItems())
})

module.exports = builder.getInterface()