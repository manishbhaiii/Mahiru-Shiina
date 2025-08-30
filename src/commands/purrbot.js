const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

// NSFW endpoints for PurrBot API (with appropriate suffixes for duplicates)
const NSFW_ENDPOINTS = [
    'blowjob2', 'cum', 'fuck', 'neko3', 'pussylick', 'solo', 'threesome'
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purrbot')
        .setDescription('Get images from PurrBot API (NSFW only)')
        .addStringOption(option =>
            option.setName('category')
                .setDescription('The image category')
                .setRequired(true)
                .addChoices(
                    ...NSFW_ENDPOINTS.map(endpoint => ({ name: endpoint, value: endpoint }))
                )),

    async execute(interaction) {
        try {
            const category = interaction.options.getString('category');
            
            // Check if channel is NSFW
            if (!interaction.channel.nsfw) {
                return interaction.reply({
                    content: 'use NSFW channels',
                    ephemeral: true
                });
            }

            // Log command usage
            await logCommand(
                interaction.user,
                `purrbot-${category}`,
                `Used PurrBot API with category: ${category}`,
                null
            );

            const image = await fetchImage(category);
            const embed = createEmbed(category, image);

            await interaction.reply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`purrbot-${category}`, interaction.user.id);
        } catch (error) {
            console.error('Error in purrbot command:', error);
            await interaction.reply({
                content: '❌ An error occurred while fetching the image.',
                ephemeral: true
            });
        }
    },

    // Handler for prefix commands
    async handlePrefixCommand(message, args) {
        try {
            // For prefix commands, the category is the command name itself
            const category = message.content.slice(process.env.PREFIX?.length || 1).trim().split(/ +/)[0].toLowerCase();

            // Check if the category is valid
            if (!NSFW_ENDPOINTS.includes(category)) {
                return message.reply(`❌ Invalid category. Available categories: ${NSFW_ENDPOINTS.join(', ')}`);
            }

            // Check if channel is NSFW
            if (!message.channel.nsfw) {
                return message.reply('use NSFW channels');
            }

            // Log command usage
            await logCommand(
                message.author,
                `purrbot-${category}`,
                `Used PurrBot API with category: ${category} (prefix command)`,
                null
            );

            const image = await fetchImage(category);
            const embed = createEmbed(category, image);

            await message.reply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`prefix-purrbot-${category}`, message.author.id);
        } catch (error) {
            console.error('Error in purrbot prefix command:', error);
            await message.reply('❌ An error occurred while fetching the image.');
        }
    },

    // Export endpoints for help command
    endpoints: {
        nsfw: NSFW_ENDPOINTS
    }
};

// Helper function to fetch image from PurrBot API
async function fetchImage(category) {
    // Remove numeric suffixes for API call
    const apiEndpoint = category.replace(/\d+$/, '');
    const response = await axios.get(`https://purrbot.site/api/img/nsfw/${apiEndpoint}/gif`);
    const data = response.data;
    
    if (!data.link) {
        throw new Error(`Failed to fetch image for category: ${category}`);
    }
    
    return data.link; // URL of the image
}

// Helper function to create embed
function createEmbed(category, imageUrl) {
    return new EmbedBuilder()
        .setColor(0xF8BE36) // Pink color
        .setTitle(`🔞 ${category}`)
        .setImage(imageUrl);
}