const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

// API base URL
const API_BASE_URL = 'https://api.waifu.pics';

// Command categories and endpoints
const SFW_ENDPOINTS = ['waifu', 'neko', 'shinobu', 'megumin', 'awoo', 'smug', 'blush', 'smile', 'wave', 'happy', 'wink', 'nom'];
const INTERACTION_ENDPOINTS = ['bully', 'cuddle', 'cry', 'hug', 'kiss', 'lick', 'pat', 'bonk', 'yeet', 'highfive', 'handhold', 'bite', 'glomp', 'slap', 'kill', 'kick'];
const NSFW_ENDPOINTS = ['waifu', 'neko', 'trap', 'blowjob'];

// Helper function to fetch image from API
async function fetchImage(endpoint, nsfw = false) {
    const category = nsfw ? 'nsfw' : 'sfw';
    const url = `${API_BASE_URL}/${category}/${endpoint}`;
    
    try {
        const response = await axios.get(url);
        return response.data.url;
    } catch (error) {
        console.error(`Error fetching ${category}/${endpoint}:`, error);
        throw new Error(`Failed to fetch image from waifu.pics API`);
    }
}

// Create embed for response
function createEmbed(imageUrl, title, description = null) {
    const embed = new EmbedBuilder()
        .setColor(0xF8BE36)
        .setTitle(title)
        .setImage(imageUrl);
    
    if (description) {
        embed.setDescription(description);
    }
    
    return embed;
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('waifupic')
        .setDescription('Get anime pictures from waifu.pics API')
        .addSubcommand(subcommand =>
            subcommand
                .setName('sfw')
                .setDescription('Get SFW anime pictures')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('The category of image to get')
                        .setRequired(true)
                        .addChoices(
                            ...SFW_ENDPOINTS.map(endpoint => ({ name: endpoint, value: endpoint }))
                        )
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('interaction')
                .setDescription('Get interaction anime pictures')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('The category of interaction to get')
                        .setRequired(true)
                        .addChoices(
                            ...INTERACTION_ENDPOINTS.map(endpoint => ({ name: endpoint, value: endpoint }))
                        )
                )
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('The user to interact with')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('nsfw')
                .setDescription('Get NSFW anime pictures (only works in NSFW channels)')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('The category of NSFW image to get')
                        .setRequired(true)
                        .addChoices(
                            ...NSFW_ENDPOINTS.map(endpoint => ({ name: endpoint, value: endpoint }))
                        )
                )
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const subcommand = interaction.options.getSubcommand();
            const category = interaction.options.getString('category');
            
            // Handle NSFW check
            if (subcommand === 'nsfw' && !interaction.channel.nsfw) {
                await interaction.editReply({
                    content: '❌ This command can only be used in NSFW channels!',
                    ephemeral: true
                });
                return;
            }
            
            let imageUrl, title, description;
            
            switch (subcommand) {
                case 'sfw':
                    imageUrl = await fetchImage(category);
                    title = `🌸 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                    break;
                    
                case 'interaction':
                    const targetUser = interaction.options.getUser('user');
                    imageUrl = await fetchImage(category);
                    title = `💕 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                    description = `${interaction.user} ${category}s ${targetUser}`;
                    break;
                    
                case 'nsfw':
                    imageUrl = await fetchImage(category, true);
                    title = `🔞 NSFW ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                    break;
            }
            
            const embed = createEmbed(imageUrl, title, description);
            
            await interaction.editReply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`waifupic-${subcommand}-${category}`, interaction.user.id);
            
            // Log command usage
            await logCommand(
                interaction.user,
                `waifupic ${subcommand}`,
                `Category: ${category}${subcommand === 'interaction' ? `, Target: ${interaction.options.getUser('user').tag}` : ''}`,
                null
            );
            
        } catch (error) {
            console.error('Error in waifupic command:', error);
            await interaction.editReply({
                content: 'Please try again!',
                ephemeral: true
            });
        }
    },
    
    // Handler for prefix commands
    async handlePrefixCommand(message, commandName, args) {
        try {
            // Determine if the command is SFW, interaction, or potentially NSFW
            let category = commandName;
            let isNsfw = false;
            let isInteraction = false;
            
            if (INTERACTION_ENDPOINTS.includes(category)) {
                isInteraction = true;
                
                // Check if a user was mentioned for interaction commands
                if (!message.mentions.users.size) {
                    await message.reply('example: !hug @user');
                    return;
                }
            } else if (NSFW_ENDPOINTS.includes(category)) {
                // Check if the command is in an NSFW channel
                if (message.channel.nsfw) {
                    isNsfw = true;
                } else if (SFW_ENDPOINTS.includes(category)) {
                    // If it's also a SFW endpoint, use the SFW version
                    isNsfw = false;
                } else {
                    await message.reply('nsfw commands can only be used in NSFW channels!');
                    return;
                }
            } else if (!SFW_ENDPOINTS.includes(category)) {
                // If it's not in any of our endpoint lists, ignore
                return;
            }
            
            // Fetch the image
            const imageUrl = await fetchImage(category, isNsfw);
            
            // Create appropriate title and description
            let title, description;
            
            if (isInteraction) {
                const targetUser = message.mentions.users.first();
                title = `💕 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                description = `${message.author} ${category}s ${targetUser}`;
            } else if (isNsfw) {
                title = `🔞 NSFW ${category.charAt(0).toUpperCase() + category.slice(1)}`;
            } else {
                title = `🌸 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
            }
            
            // Create and send embed
            const embed = createEmbed(imageUrl, title, description);
            await message.reply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`prefix-${commandName}`, message.author.id);
            
            // Log command usage
            await logCommand(
                message.author,
                `prefix-${commandName}`,
                `Category: ${category}${isInteraction ? `, Target: ${message.mentions.users.first().tag}` : ''}`,
                null
            );
            
        } catch (error) {
            console.error(`Error in prefix command ${commandName}:`, error);
            await message.reply('Please try again!');
        }
    },

    // Export endpoints for help command
    endpoints: {
        sfw: SFW_ENDPOINTS,
        interaction: INTERACTION_ENDPOINTS,
        nsfw: NSFW_ENDPOINTS
    }
};