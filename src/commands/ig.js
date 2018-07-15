const { SlashCommandBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

function extractReelId(link) {
    try {
        // Handle different Instagram URL patterns
        const patterns = [
            /instagram\.com\/reels?\/([A-Za-z0-9_-]+)/,
            /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
            /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
            /\/([A-Za-z0-9_-]{11})\/?/  // Generic ID pattern
        ];

        for (const pattern of patterns) {
            const match = link.match(pattern);
            if (match && match[1]) {
                // Clean up the ID by removing any query parameters
                return match[1].split('?')[0].split('/')[0];
            }
        }
        return null;
    } catch (error) {
        console.error('Error extracting reel ID:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ig')
        .setDescription('Convert Instagram reel link to viewable format')
        .addStringOption(option =>
            option.setName('link')
                .setDescription('The Instagram reel/post link')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('text')
                .setDescription('Custom text to display with the link')
                .setRequired(false)),

    async execute(interaction) {
        try {
            const link = interaction.options.getString('link');
            const customText = interaction.options.getString('text');

            // Extract reel ID
            const reelId = extractReelId(link);
            
            if (!reelId) {
                await interaction.reply({
                    content: '❌ Could not find a valid Instagram post/reel ID in the link. Please make sure you\'re sharing a valid Instagram link!',
                    ephemeral: true
                });
                return;
            }

            // Store the reel ID
            await reelManager.addReel(reelId);

            // Construct new link
            const kkInstagramLink = `https://kkinstagram.com/reels/${reelId}`;

            // Format output message
            const displayText = customText || interaction.user.username;
            const formattedMessage = `[${displayText}](${kkInstagramLink})`;

            // Update stats and log command
            reelManager.updateStats('ig', interaction.user.id);
            await logCommand(
                interaction.user,
                'ig',
                `Original Link: ${link}`,
                `Converted: ${kkInstagramLink}`
            );

            // Send response
            await interaction.reply({
                content: formattedMessage,
                allowedMentions: { parse: [] }
            });

        } catch (error) {
            console.error('Error in ig command:', error);
            await interaction.reply({
                content: '❌ An error occurred while processing your request.',
                ephemeral: true
            });
        }
    },
}; 