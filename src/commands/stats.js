const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View today\'s bot usage statistics'),

    async execute(interaction) {
        try {
            const stats = reelManager.getDailyStats();

            const embed = new EmbedBuilder()
                .setColor(0x00FFFF)
                .setTitle('📊 Daily Statistics')
                .setDescription('➥Here are today\'s usage statistics:')
                .addFields(
                    {
                        name: '🔄 Reels Converted',
                        value: `➥\`${stats.igUsage}\` reels converted using \`/ig\``,
                        inline: true
                    },
                    {
                        name: '🎲 Random Reels',
                        value: `➥\`${stats.randomUsage}\` times \`/random\` used`,
                        inline: true
                    },
                    {
                        name: '👥 Unique Users',
                        value: `➥\`${stats.uniqueUsers}\` different users today`,
                        inline: true
                    },
                    {
                        name: '📈 Total Commands',
                        value: `➥\`${stats.totalCommands}\` commands executed today`,
                        inline: true
                    }
                )
                .setFooter({
                    text: '➜ Stats reset daily at midnight • Powered by Mahiru Shiina'
                })
                .setTimestamp();

            // Update stats and log command
            reelManager.updateStats('stats', interaction.user.id);
            await logCommand(
                interaction.user,
                'stats',
                null,
                `Viewed daily statistics`
            );

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in stats command:', error);
            await interaction.reply({
                content: '❌ An error occurred while fetching statistics.',
                ephemeral: true
            });
        }
    },
}; 