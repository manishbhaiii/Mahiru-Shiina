const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const axios = require('axios');
const reelManager = require('../utils/reelManager');

// NSFW endpoints for Nekobot.xyz API
const NSFW_ENDPOINTS = [
    'hass', 'hmidriff', 'pgif', '4k', 'hentai', 'holo', 'hneko', 'neko', 'hkitsune', 
    'kemonomimi', 'anal', 'hanal', 'gonewild', 'kanna', 'ass', 'pussy', 'thigh', 'hthigh', 
    'gah', 'coffee', 'food', 'paizuri', 'tentacle', 'boobs', 'hboobs'
    // 'yaoi' - removed to stay under 25 choices limit
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nekobot')
        .setDescription('Get images from Nekobot.xyz API (NSFW only)')
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
                `nekobot-${category}`,
                `Used Nekobot.xyz API with category: ${category}`,
                null
            );

            const image = await fetchImage(category);
            const embed = createEmbed(category, image);

            await interaction.reply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`nekobot-${category}`, interaction.user.id);
        } catch (error) {
            console.error('Error in nekobot command:', error);
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
                `nekobot-${category}`,
                `Used Nekobot.xyz API with category: ${category} (prefix command)`,
                null
            );

            const image = await fetchImage(category);
            const embed = createEmbed(category, image);

            await message.reply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats(`prefix-nekobot-${category}`, message.author.id);
        } catch (error) {
            console.error('Error in nekobot prefix command:', error);
            await message.reply('❌ An error occurred while fetching the image.');
        }
    },

    // Export endpoints for help command
    endpoints: {
        nsfw: NSFW_ENDPOINTS
    }
};

// Helper function to fetch image from Nekobot.xyz API
async function fetchImage(category) {
    const response = await axios.get(`https://nekobot.xyz/api/image?type=${category}`);
    const data = response.data;
    
    if (!data.success || !data.message) {
        throw new Error(`Failed to fetch image for category: ${category}`);
    }
    
    return data.message; // URL of the image
}

// Helper function to create embed
function createEmbed(category, imageUrl) {
    return new EmbedBuilder()
        .setColor(0xF8BE36) // Pink color
        .setTitle(`🔞 ${category}`)
        .setImage(imageUrl);
}