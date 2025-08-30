const { Events } = require('discord.js');
const rule34Command = require('../commands/rule34');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        // Handle slash commands
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing ${interaction.commandName}`);
                console.error(error);

                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: '❌ There was an error while executing this command!',
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: '❌ There was an error while executing this command!',
                        ephemeral: true
                    });
                }
            }
            return;
        }

        // Handle button interactions
        if (interaction.isButton()) {
            try {
                // Check if it's a Rule34 navigation button
                if (interaction.customId.includes('_') && 
                    ['prev', 'next', 'random', 'save', 'jump'].includes(interaction.customId.split('_')[0])) {
                    await rule34Command.handleButtonInteraction(interaction);
                    return;
                }
            } catch (error) {
                console.error('Error handling button interaction:', error);
                await interaction.reply({
                    content: '❌ There was an error while handling this interaction!',
                    ephemeral: true
                }).catch(() => {});
            }
        }
    },
}; 