const { SlashCommandBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('random')
        .setDescription('Get a random Instagram reel'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const reelId = reelManager.getRandomReel();
            
            if (!reelId) {
                await interaction.editReply({
                    content: '❌ No reels available yet! Use `/ig` command with some reels first.',
                    ephemeral: true
                });
                return;
            }

            const kkInstagramLink = `https://kkinstagram.com/reels/${reelId}`;

            // Format message like /ig command
            const formattedMessage = `[⚡](${kkInstagramLink})`;

            // Update stats and log command
            reelManager.updateStats('random', interaction.user.id);
            await logCommand(
                interaction.user,
                'random',
                null,
                `Selected: ${kkInstagramLink}`
            );

            await interaction.editReply({
                content: formattedMessage,
                allowedMentions: { parse: [] }
            });

        } catch (error) {
            console.error('Error in random command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while fetching a random reel. Please try again!',
                ephemeral: true
            });
        }
    },
}; 
