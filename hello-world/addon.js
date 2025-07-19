const { addonBuilder } = require("stremio-addon-sdk")
const fs = require('fs').promises
const path = require('path')

const getMetaFromFile = async (type) => {
	try {
		const filePath = path.join(__dirname, 'meta-data.json')
		const data = await fs.readFile(filePath, 'utf8')
		const allMetas = JSON.parse(data)
		return allMetas.filter(meta => meta.type === type)
	} catch (error) {
		console.error('Error reading meta-data.json:', error)
		return []
	}
}

// Docs: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/responses/manifest.md
const manifest = {
	"id": "community.OurWatchlist",
	"version": "0.0.1",
	"catalogs": [
		{
			"type": "movie",
			"id": "Our Watchlist",
		},
		{
			"type": "series",
			"id": "Our Watchlist",
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
	const metas = await getMetaFromFile(type);
	return { metas };
})

module.exports = builder.getInterface()
