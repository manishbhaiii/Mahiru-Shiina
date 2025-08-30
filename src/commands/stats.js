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
                        name: '🎬 Core Commands',
                        value: `➥**IG Converter:** \`${stats.igUsage}\` uses\n➥**Random Reels:** \`${stats.randomUsage}\` uses`,
                        inline: true
                    },
                    {
                        name: '🖼️ Image APIs',
                        value: `➥**Waifu.pics:** \`${stats.waifupicUsage}\` uses\n➥**Nekobot:** \`${stats.nekobotUsage}\` uses\n➥**Nekos.best:** \`${stats.nekosBestUsage}\` uses`,
                        inline: true
                    },
                    {
                        name: '🔞 NSFW APIs',
                        value: `➥**PurrBot:** \`${stats.purrBotUsage}\` uses\n➥**Rule34:** \`${stats.rule34Usage}\` uses`,
                        inline: true
                    },
                    {
                        name: '⚙️ Utility Commands',
                        value: `➥**Help:** \`${stats.helpUsage}\` uses\n➥**Stats:** \`${stats.statsUsage}\` uses\n➥**Other:** \`${stats.otherUsage}\` uses`,
                        inline: true
                    },
                    {
                        name: '👥 User Stats',
                        value: `➥**Unique Users:** \`${stats.uniqueUsers}\` today`,
                        inline: true
                    },
                    {
                        name: '📈 Total Usage',
                        value: `➥**Total Commands:** \`${stats.totalCommands}\` today`,
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