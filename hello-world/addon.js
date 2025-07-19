const { addonBuilder } = require("stremio-addon-sdk")
const getItems = require('./get-items')

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

builder.defineCatalogHandler(async ({type, id, extra}) => {
	console.log("request for catalogs: "+type+" "+id)
	const metas = await getItems();
	return { metas };
})

module.exports = builder.getInterface()
