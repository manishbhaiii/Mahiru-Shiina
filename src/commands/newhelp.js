const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const { inviteLink, supportServer, githubRepo } = require('../config.json');
const reelManager = require('../utils/reelManager');

// Import command endpoints
const waifuPicCommand = require('./waifupic');
const nekobotCommand = require('./Nekobot');
const nekosBestCommand = require('./Nekosbest');
const purrBotCommand = require('./purrbot');
const rule34Command = require('./rule34');

// Command categories and endpoints
const SFW_ENDPOINTS = waifuPicCommand.endpoints.sfw;
const INTERACTION_ENDPOINTS = waifuPicCommand.endpoints.interaction;
const WAIFU_NSFW_ENDPOINTS = waifuPicCommand.endpoints.nsfw;
const NEKOBOT_NSFW_ENDPOINTS = nekobotCommand.endpoints.nsfw;
const NEKOSBEST_SFW_ENDPOINTS = nekosBestCommand.endpoints.sfw;
const NEKOSBEST_INTERACTION_ENDPOINTS = nekosBestCommand.endpoints.interaction;
const PURRBOT_NSFW_ENDPOINTS = purrBotCommand.endpoints.nsfw;
const RULE34_SPECIAL_ENDPOINTS = rule34Command.endpoints.special;

// Command categories for select menu
const CATEGORIES = {
    SFW: 'sfw',
    INTERACTION: 'interaction',
    NSFW: 'nsfw'
};

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows help for all bot commands'),

    async execute(interaction) {
        try {
            const embed = createMainEmbed();
            const row = createSelectMenuRow();
            const buttonRow = createButtonRow();

            // Update stats
            reelManager.updateStats('help', interaction.user.id);

            // Log command usage
            await logCommand(
                interaction.user,
                'help',
                'Viewed help menu',
                null
            );

            await interaction.reply({ 
                embeds: [embed], 
                components: [row, buttonRow] 
            });

            // Create collector for select menu interactions
            const collector = interaction.channel.createMessageComponentCollector({ 
                filter: i => i.user.id === interaction.user.id && i.message.interaction.id === interaction.id,
                time: 60000 // 1 minute
            });

            collector.on('collect', async i => {
                if (i.isStringSelectMenu()) {
                    const selectedCategory = i.values[0];
                    let updatedEmbed;

                    switch (selectedCategory) {
                        case CATEGORIES.SFW:
                            updatedEmbed = createSfwEmbed();
                            break;
                        case CATEGORIES.INTERACTION:
                            updatedEmbed = createInteractionEmbed();
                            break;
                        case CATEGORIES.NSFW:
                            updatedEmbed = createNsfwEmbed();
                            break;
                        default:
                            updatedEmbed = createMainEmbed();
                    }

                    await i.update({ 
                        embeds: [updatedEmbed], 
                        components: [row, buttonRow] 
                    });
                }
            });

            collector.on('end', async () => {
                // Disable select menu when collector ends
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('category_select')
                            .setPlaceholder('type !help again')
                            .setDisabled(true)
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Expired')
                                    .setValue('expired')
                            )
                    );

                await interaction.editReply({ 
                    components: [disabledRow, buttonRow] 
                }).catch(() => {});
            });
        } catch (error) {
            console.error('Error in newhelp command:', error);
            await interaction.reply({
                content: '❌ An error occurred while showing help.',
                ephemeral: true
            });
        }
    },

    // Handler for prefix help command
    async handlePrefixCommand(message) {
        try {
            const embed = createMainEmbed();
            const row = createSelectMenuRow();
            const buttonRow = createButtonRow();

            // Update stats
            reelManager.updateStats('prefix-help', message.author.id);

            // Log command usage
            await logCommand(
                message.author,
                'prefix-help',
                'Viewed help menu via prefix command',
                null
            );

            const reply = await message.reply({ 
                embeds: [embed], 
                components: [row, buttonRow] 
            });

            
            const collector = reply.createMessageComponentCollector({ 
                filter: i => i.user.id === message.author.id,
                time: 60000
            });

            collector.on('collect', async i => {
                if (i.isStringSelectMenu()) {
                    const selectedCategory = i.values[0];
                    let updatedEmbed;

                    switch (selectedCategory) {
                        case CATEGORIES.SFW:
                            updatedEmbed = createSfwEmbed();
                            break;
                        case CATEGORIES.INTERACTION:
                            updatedEmbed = createInteractionEmbed();
                            break;
                        case CATEGORIES.NSFW:
                            updatedEmbed = createNsfwEmbed();
                            break;
                        default:
                            updatedEmbed = createMainEmbed();
                    }

                    await i.update({ 
                        embeds: [updatedEmbed], 
                        components: [row, buttonRow] 
                    });
                }
            });

            collector.on('end', async () => {
                // Disable select menu when collector end
                const disabledRow = new ActionRowBuilder()
                    .addComponents(
                        new StringSelectMenuBuilder()
                            .setCustomId('category_select')
                            .setPlaceholder('run !help again')
                            .setDisabled(true)
                            .addOptions(
                                new StringSelectMenuOptionBuilder()
                                    .setLabel('Expired')
                                    .setValue('expired')
                            )
                    );

                await reply.edit({ 
                    components: [disabledRow, buttonRow] 
                }).catch(() => {});
            });
        } catch (error) {
            console.error('Error in prefix help command:', error);
            await message.reply('❌ An error occurred while showing help.');
        }
    }
};

// Helper function to create select menu row
function createSelectMenuRow() {
    return new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('category_select')
                .setPlaceholder('click here')
                .addOptions(
                    new StringSelectMenuOptionBuilder()
                        .setLabel('SFW Commands')
                        .setValue(CATEGORIES.SFW)
                        .setEmoji('<:sfw:1411065726684631150>'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('Interaction Commands')
                        .setValue(CATEGORIES.INTERACTION)
                        .setEmoji('<:love:1411064475796115537>'),
                    new StringSelectMenuOptionBuilder()
                        .setLabel('NSFW Commands')
                        .setValue(CATEGORIES.NSFW)
                        .setEmoji('<:18:1411063743202332835>')
                )
        );
}

// Helper function to create main embed
function createMainEmbed() {
    const prefix = process.env.PREFIX || '!';
    
    return new EmbedBuilder()
        .setColor(0xF8BE36) // Pink color
        .setTitle('🌸 Mahiru Shiina Commands 🌸')
        .setDescription(`- my prefix is \`${prefix}\`\n`)
        .addFields(
            { 
                name: 'SFW',
                value: `${SFW_ENDPOINTS.length + NEKOSBEST_SFW_ENDPOINTS.length} commands`,
                inline: true
            },
            {
                name: 'Interaction',
                value: `${INTERACTION_ENDPOINTS.length + NEKOSBEST_INTERACTION_ENDPOINTS.length} commands`,
                inline: true
            },
            {
                name: 'NSFW',
                value: `${WAIFU_NSFW_ENDPOINTS.length + NEKOBOT_NSFW_ENDPOINTS.length + PURRBOT_NSFW_ENDPOINTS.length + RULE34_SPECIAL_ENDPOINTS.length} commands`,
                inline: true
            }
        )
        .setFooter({ 
            text: 'Made with ❤️ by it\'s Manish'
        })
        .setImage('https://images-wixmp-ed30a86b8c4ca887773594c2.wixmp.com/f/2527acb8-4310-4046-89a1-59a46ab49a8e/dffzv1h-2dda306f-3f61-4c44-ad81-6e00f1892011.jpg/v1/fill/w_1024,h_166,q_75,strp/shiina_mahiru_banner_by_s6ugo_dffzv1h-fullview.jpg?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ1cm46YXBwOjdlMGQxODg5ODIyNjQzNzNhNWYwZDQxNWVhMGQyNmUwIiwiaXNzIjoidXJuOmFwcDo3ZTBkMTg4OTgyMjY0MzczYTVmMGQ0MTVlYTBkMjZlMCIsIm9iaiI6W1t7ImhlaWdodCI6Ijw9MTY2IiwicGF0aCI6IlwvZlwvMjUyN2FjYjgtNDMxMC00MDQ2LTg5YTEtNTlhNDZhYjQ5YThlXC9kZmZ6djFoLTJkZGEzMDZmLTNmNjEtNGM0NC1hZDgxLTZlMDBmMTg5MjAxMS5qcGciLCJ3aWR0aCI6Ijw9MTAyNCJ9XV0sImF1ZCI6WyJ1cm46c2VydmljZTppbWFnZS5vcGVyYXRpb25zIl19.Boa769i9kmRZaJ0mkH-Alt0v6EeRsF5PHMrRKj9-wGc');
}

// Helper function to create SFW embed
function createSfwEmbed() {
    const prefix = process.env.PREFIX || '!';
    
    return new EmbedBuilder()
        .setColor(0xF8BE36) // Pink color
        .setTitle('🎀 SFW Commands')
        .addFields(
            { 
                name: 'Source Waifu.pics',
                value: SFW_ENDPOINTS.map(cmd => `\`${prefix}${cmd}\``).join(', '),
                inline: false
            },
            { 
                name: 'Source Nekos.best',
                value: NEKOSBEST_SFW_ENDPOINTS.map(cmd => `\`${prefix}${cmd}\``).join(', '),
                inline: false
            }
        )
        .setFooter({ 
            text: '• Select another category from the dropdown'
        });
}

// Helper function to create Interaction embed
function createInteractionEmbed() {
    const prefix = process.env.PREFIX || '!';
    
    return new EmbedBuilder()
        .setColor(0xF8BE36) // Pink color
        .setTitle('💕 Interaction Commands')
        .addFields(
            { 
                name: 'Source Waifu.pics',
                value: INTERACTION_ENDPOINTS.map(cmd => `\`${prefix}${cmd} @user\``).join(', '),
                inline: false
            },
            { 
                name: 'Source Nekos.best',
                value: NEKOSBEST_INTERACTION_ENDPOINTS.map(cmd => `\`${prefix}${cmd} @user\``).join(', '),
                inline: false
            }
        )
        .setFooter({ 
            text: '• Select another category from the dropdown'
        });
}

// Helper function to create NSFW embed
function createNsfwEmbed() {
    const prefix = process.env.PREFIX || '!';
    
    return new EmbedBuilder()
        .setColor(0xF8BE36) // pick color here 
        .setTitle('🔞 NSFW Commands')
        .setDescription(`_ _`)
        .addFields(
            { 
                name: 'Source Waifu.pics',
                value: WAIFU_NSFW_ENDPOINTS.map(cmd => `\`${prefix}${cmd}\``).join(', '),
                inline: false
            },
            { 
                name: 'Source Nekobot.xyz',
                value: NEKOBOT_NSFW_ENDPOINTS.map(cmd => `\`${prefix}${cmd}\``).join(', '),
                inline: false
            },
            { 
                name: 'Source PurrBot',
                value: PURRBOT_NSFW_ENDPOINTS.map(cmd => `\`${prefix}${cmd}\``).join(', '),
                inline: false
            },
            { 
                name: 'Search on Rule34.xxx',
                value: `\`${prefix}r34 <query>\` - Interactive search with navigation buttons`,
                inline: false
            }
        )
        .setFooter({ 
            text: '• Select another category from the dropdown'
        });
}

// Helper function to create button row
function createButtonRow() {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setLabel('Support Server')
                .setEmoji('<:AsunaYay:1384777634726285373>')
                .setStyle(ButtonStyle.Link)
                .setURL(supportServer),
            new ButtonBuilder()
                .setLabel('GitHub')
                .setEmoji('<:MiyanoHey:1410791249300164681>')
                .setStyle(ButtonStyle.Link)
                .setURL(githubRepo)
        );
} 