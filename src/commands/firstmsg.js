const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('firstmsg')
        .setDescription('Get the first message in this channel'),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            // Fetch the first message
            const messages = await interaction.channel.messages.fetch({ 
                limit: 1,
                after: '0'
            });
            
            const firstMessage = messages.first();

            if (!firstMessage) {
                return await interaction.editReply({
                    content: '❌ Could not find the first message in this channel.',
                    ephemeral: true
                });
            }

            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle('i got it bro 😎')
                .setDescription(`[trust me Click here](${firstMessage.url})`)
                .addFields(
                    { 
                        name: 'Author 🍂', 
                        value: `${firstMessage.author.tag}`, 
                        inline: true 
                    },
                    { 
                        name: 'Sent At', 
                        value: `<t:${Math.floor(firstMessage.createdTimestamp / 1000)}:F>`, 
                        inline: true 
                    }
                )
                .setFooter({ 
                    text: `Message ID: ${firstMessage.id}` 
                });

            // Log the command usage
            await logCommand(
                interaction.user,
                'firstmsg',
                `Found first message in #${interaction.channel.name}`,
                null
            );

            await interaction.editReply({ embeds: [embed] });

        } catch (error) {
            console.error('Error in firstmsg command:', error);
            await interaction.editReply({
                content: '🤡 First, [add me](https://discord.com/oauth2/authorize?client_id=1364660109858574470) to the server, then you can use this command.',
                ephemeral: true
            });
        }
    },
}; 