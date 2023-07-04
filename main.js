const Discord = require('discord.js');
const puppeteer = require('puppeteer');
const Database = require('@replit/database');
const config = require('./config.json')

const db = new Database();

// Creates a new Discord bot
const client = new Discord.Client({ intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent
] });


// Confirms launch of bot
client.once('ready', () => {
    console.log('client ready');
})


// Checks for message in discord channel
client.on('messageCreate', message => {

    if (message.author.bot) return

    // Checks for valid command from discord channel
    if (message.content === "$helltide" ||
        message.content === "$boss" ||
        message.content === "$legion") {
            scrapeData(message);
    }
})

// Scrapes data from webpage and replies to discord user with remaining time until event triggers
async function scrapeData(request) {
    const browser = await puppeteer.launch(); // Launches headless browser
    const page = await browser.newPage();
    await page.goto("https:helltides.com"); // Webpage where we scrape data
    let selector

    // Checks for one of three events in Diablo 4 and sets selector accordingly
    switch(request.content) {
        case "$boss":
            selector = '[class="text-xl xl:text-[1.35rem] text-center font-mono mb-2"]';
            break;

        case "$helltide":
            // w-full h-full relative gets zoomed in version of correct image
            // class="leaflet-image-layer leaflet-zoom-animated" gets full image but with other stuff
            selector = '[class="text-xl xl:text-[1.35rem] font-mono mb-4"]';
            await page.waitForSelector('[class="leaflet-image-layer leaflet-zoom-animated"]');
            const logo = await page.$('[class="leaflet-image-layer leaflet-zoom-animated"]');
            await logo.screenshot({
                path: 'test-image-01.png'
            })
            break;

        case "$legion":
            await page.goto("https:d4armory.io/events") // helltides.com does not have a legion timer yet
            selector = "#tableLegionNext";
            break;

        default:
            break;
    }

    // Waits for selector to load and replies with remaining time until event trigger
    const data = await page.waitForSelector(selector);
    request.reply(String(await data?.evaluate(el => el.textContent)))
}


client.login(config.token);