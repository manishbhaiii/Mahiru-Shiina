const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

// API base URL
const API_BASE_URL = 'https://nekos.best/api/v2';

// SFW endpoints for Nekos.best API (with "2" suffix for duplicates)
const SFW_ENDPOINTS = [
    'husbando', 'kitsune', 'neko2', 'waifu2', 'angry', 'baka', 'blush2', 
    'bored', 'cry2', 'dance2', 'happy2', 'laugh', 'lurk', 'nod', 'nom', 
    'nope', 'pout', 'run', 'shoot', 'shrug', 'sleep', 'smile2', 'smug2', 
    'stare', 'think', 'thumbsup', 'wave2', 'wink2', 'yawn'
];

// Interaction endpoints for Nekos.best API (with "2" suffix for duplicates)
const INTERACTION_ENDPOINTS = [
    'bite2', 'cuddle2', 'facepalm', 'feed', 'handhold2', 'handshake', 
    'highfive2', 'hug2', 'kick2', 'kiss2', 'pat2', 'peck', 'poke', 
    'punch', 'slap2', 'tickle', 'yeet2'
];

// Helper function to fetch image from Nekos.best API
async function fetchImage(endpoint) {
    // Remove the "2" suffix for API call
    const apiEndpoint = endpoint.replace('2', '');
    const url = `${API_BASE_URL}/${apiEndpoint}`;
    
    try {
        const response = await axios.get(url);
        return response.data.results[0].url;
    } catch (error) {
        console.error(`Error fetching ${apiEndpoint}:`, error);
        throw new Error(`Failed to fetch image from nekos.best API`);
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
        .setName('nekosbest')
        .setDescription('Get anime pictures from nekos.best API')
        .addSubcommand(subcommand =>
            subcommand
                .setName('sfw')
                .setDescription('Get SFW anime pictures')
                .addStringOption(option =>
                    option.setName('category')
                        .setDescription('The category of image to get')
                        .setRequired(true)
                        .addChoices(
                            ...SFW_ENDPOINTS.slice(0, 25).map(endpoint => ({ name: endpoint, value: endpoint }))
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
        ),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            
            const subcommand = interaction.options.getSubcommand();
            const category = interaction.options.getString('category');
            
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
                    description = `${interaction.user} ${category.replace('2', '')}s ${targetUser}`;
                    break;
            }
            
            const embed = createEmbed(imageUrl, title, description);
            
            await interaction.editReply({ embeds: [embed] });
            
            // Update stats
            reelManager.updateStats('nekosbest', interaction.user.id);
            
            // Log command usage
            await logCommand(
                interaction.user,
                `nekosbest ${subcommand}`,
                `Category: ${category}${subcommand === 'interaction' ? `, Target: ${interaction.options.getUser('user').tag}` : ''}`,
                null
            );
            
        } catch (error) {
            console.error('Error in nekosbest command:', error);
            await interaction.editReply({
                content: 'Please try again!',
                ephemeral: true
            });
        }
    },
    
    // Handler for prefix commands
    async handlePrefixCommand(message, commandName, args) {
        try {
            // Determine if the command is SFW or interaction
            let category = commandName;
            let isInteraction = false;
            
            if (INTERACTION_ENDPOINTS.includes(category)) {
                isInteraction = true;
                
                // Check if a user was mentioned for interaction commands
                if (!message.mentions.users.size) {
                    await message.reply(`example: !${category} @user`);
                    return;
                }
            } else if (!SFW_ENDPOINTS.includes(category)) {
                // If it's not in our endpoint lists, ignore
                return;
            }
            
            // Fetch the image
            const imageUrl = await fetchImage(category);
            
            // Create appropriate title and description
            let title, description;
            
            if (isInteraction) {
                const targetUser = message.mentions.users.first();
                title = `💕 ${category.charAt(0).toUpperCase() + category.slice(1)}`;
                description = `${message.author} ${category.replace('2', '')}s ${targetUser}`;
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
        interaction: INTERACTION_ENDPOINTS
    }
};