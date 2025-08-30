const { Events } = require('discord.js');
require('dotenv').config();

// Import command handlers
const waifuPicCommand = require('../commands/waifupic');
const helpCommand = require('../commands/newhelp');
const nekobotCommand = require('../commands/Nekobot');
const nekosBestCommand = require('../commands/Nekosbest');
const purrBotCommand = require('../commands/purrbot');
const rule34Command = require('../commands/rule34');

// Get Nekobot.xyz API endpoints
const NEKOBOT_ENDPOINTS = nekobotCommand.endpoints.nsfw;

// Get Nekos.best API endpoints
const NEKOSBEST_SFW_ENDPOINTS = nekosBestCommand.endpoints.sfw;
const NEKOSBEST_INTERACTION_ENDPOINTS = nekosBestCommand.endpoints.interaction;

// Get PurrBot API endpoints
const PURRBOT_NSFW_ENDPOINTS = purrBotCommand.endpoints.nsfw;

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Get prefix from environment variables or use default
        const prefix = process.env.PREFIX || '!';

        // Check if message starts with prefix
        if (!message.content.startsWith(prefix)) return;

        // Extract command name and arguments
        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        // Handle different prefix commands
        try {
            // Waifu pics commands
            if (['waifu', 'neko', 'shinobu', 'megumin', 'awoo', 'smug', 'blush', 'smile', 'wave', 'happy', 'wink', 'nom',
                 'bully', 'cuddle', 'cry', 'hug', 'kiss', 'lick', 'pat', 'bonk', 'yeet', 'highfive', 'handhold', 'bite', 'glomp', 'slap', 'kill', 'kick',
                 'trap', 'blowjob'].includes(commandName)) {
                
                await waifuPicCommand.handlePrefixCommand(message, commandName, args);
                return;
            }

            // Nekobot.xyz API commands
            if (NEKOBOT_ENDPOINTS.includes(commandName)) {
                await nekobotCommand.handlePrefixCommand(message, args);
                return;
            }

            // Nekos.best API commands
            if (NEKOSBEST_SFW_ENDPOINTS.includes(commandName) || NEKOSBEST_INTERACTION_ENDPOINTS.includes(commandName)) {
                await nekosBestCommand.handlePrefixCommand(message, commandName, args);
                return;
            }

            // PurrBot API commands
            if (PURRBOT_NSFW_ENDPOINTS.includes(commandName)) {
                await purrBotCommand.handlePrefixCommand(message, args);
                return;
            }

            // Rule34 command
            if (commandName === 'r34') {
                await rule34Command.handlePrefixCommand(message, args);
                return;
            }

            // Help command
            if (commandName === 'help') {
                await helpCommand.handlePrefixCommand(message);
                return;
            }

            // Add other prefix commands here as needed

        } catch (error) {
            console.error(`Error executing prefix command ${commandName}:`, error);
            await message.reply('❌ There was an error while executing this command!');
        }
    },
};