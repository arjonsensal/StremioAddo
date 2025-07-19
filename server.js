#!/usr/bin/env node

const { serveHTTP, publishToCentral } = require("stremio-addon-sdk")
const addonInterface = require("./addon")
const getItems = require("./get-items")

const updateItems = async () => {
    try {
        const filePath = await getItems()
        console.log(`Items updated and saved to ${filePath}`)
    } catch (error) {
        console.error('Error updating items:', error)
    }
}

// Call updateItems immediately when the server starts
updateItems()

// Call updateItems every 5 minutes
setInterval(updateItems, 600000)

serveHTTP(addonInterface, { port: process.env.PORT })

// when you've deployed your addon, un-comment this line
// publishToCentral("https://my-addon.awesome/manifest.json")
// for more information on deploying, see: https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/deploying/README.md
