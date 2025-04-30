const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check the bot\'s latency and status'),

    async execute(interaction) {
        try {
            const sent = await interaction.deferReply({ fetchReply: true });
            const latency = sent.createdTimestamp - interaction.createdTimestamp;
            const wsLatency = interaction.client.ws.ping;

            const getEmoji = (ms) => {
                if (ms < 100) return '🚀';
                if (ms < 200) return '⚡';
                if (ms < 400) return '🏃';
                return '🐌';
            };

            // Calculate uptime
            const uptime = interaction.client.uptime;
            const days = Math.floor(uptime / 86400000);
            const hours = Math.floor((uptime % 86400000) / 3600000);
            const minutes = Math.floor((uptime % 3600000) / 60000);
            const seconds = Math.floor((uptime % 60000) / 1000);
            const uptimeString = `${days}d ${hours}h ${minutes}m ${seconds}s`;

            const embed = new EmbedBuilder()
                .setColor(0x00FF00)
                .setTitle('🏓 Pong!')
                .addFields(
                    {
                        name: `${getEmoji(latency)} Bot Latency`,
                        value: `\`${latency}ms\``,
                        inline: true
                    },
                    {
                        name: `${getEmoji(wsLatency)} WebSocket`,
                        value: `\`${wsLatency}ms\``,
                        inline: true
                    },
                    {
                        name: '⏰ Uptime',
                        value: `\`${uptimeString}\``,
                        inline: false
                    }
                )
                .setFooter({ text: 'Mahiru Shiina Made with 💖' });

            // Update stats and log command
            reelManager.updateStats('ping', interaction.user.id);
            await logCommand(
                interaction.user,
                'ping',
                `Latency: ${latency}ms, WebSocket: ${wsLatency}ms`,
                null
            );

            await interaction.editReply({ embeds: [embed] });
        } catch (error) {
            console.error('Error in ping command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while checking latency.',
                ephemeral: true
            });
        }
    },
}; 