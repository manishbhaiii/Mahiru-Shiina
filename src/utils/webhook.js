const { WebhookClient, EmbedBuilder } = require('discord.js');
const moment = require('moment');

const webhookClient = new WebhookClient({ url: process.env.WEBHOOK_URL });

async function logCommand(user, command, details = null, result = null) {
    try {
        const embed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('Command Usage Log')
            .addFields(
                {
                    name: 'User',
                    value: `${user.tag} (${user.id})`,
                    inline: true
                },
                {
                    name: 'Command',
                    value: command,
                    inline: true
                }
            )
            .setTimestamp();

        if (details) {
            embed.addFields({
                name: 'Details',
                value: details,
                inline: false
            });
        }

        if (result) {
            embed.addFields({
                name: 'Result',
                value: result,
                inline: false
            });
        }

        await webhookClient.send({
            embeds: [embed]
        });
    } catch (error) {
        console.error('Error sending webhook:', error);
    }
}

module.exports = { logCommand }; 