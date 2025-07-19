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
let items = [{id: 'tt9198364', type: 'movie'},
	{id: 'tt1259528', type: 'movie'},
	{id: 'tt7724322', type: 'movie'}]
const getItems = async() => {
	try {
		console.log('Found items:');
		const requests = items.map(item => needle('get', 'https://v3-cinemeta.strem.io/meta/' + item.type + '/' + item.id + '.json'));
		const responses = await Promise.all(requests)
		const metaArray = responses.map((response, index) => {
			if (response.statusCode === 200) {
				console.log(`Data from ${items[index].id}:`, response.body.meta);
				return response.body.meta;
			} else {
				console.error(`Error fetching ${items[index].id}: Status Code ${response.statusCode}`);
				return null;
			}
		}).filter(meta => meta !== null);
		return metaArray;
	} catch (error) {
		console.error('Failed to fetch items:', error);
		return [];
	}
}

builder.defineCatalogHandler(async ({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id)
	const metas = await getItems();
	return { metas };
})

module.exports = builder.getInterface()
