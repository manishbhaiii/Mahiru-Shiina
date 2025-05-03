const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const reelManager = require('../utils/reelManager');
const { inviteLink, supportServer, githubRepo, youtubeChannel, instagramPage } = require('../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Shows how to use the bot'),

    async execute(interaction) {
        try {
            const embed = new EmbedBuilder()
                .setColor(0x0099FF)
                .setTitle(' ━━━🔥 Mahiru Shiina commands 🔥━━━➤')
                .setDescription('Watch Instagram reels on Discord 💀')
                .addFields(
                    { 
                        name: '🎯 Main Command',
                        value: '➥`/ig <link> [text]`\n• `link`: Instagram reel URL 🔗\n• `text`: Optional custom text 💬'
                    },
                    {
                        name: '📝 Example Usage',
                        value: '➥`/ig https://www.instagram.com/reels/ABC123 Check this out!`'
                    },
                    {
                        name: '🎮 Other Commands',
                        value: '➥`/help` - you know i know 😅\n➥`/ping` - Check bot is alive or not 👽\n➥`/random` - Get a random insta reel 🔎\n➥`/stats` - View usage statistics 📊\n➥`/firstmsg` - Get first message of the channel 📝\n➥`/say` - convert text to voice msg🥱'
                    },
                    {
                        name: '💡 fun fact',
                        value: '✦➤ THIS BOT IS OPEN SOURCE BY [it\'s Manish](https://github.com/manishbhaiii/Mahiru-Shiina)\n✦➤ HELP US BY WATCHING ADS 🫠\n✦➤ [ADS LINK 1](https://linkvertise.com/1175425/mahiru-shiina-discord-bot?o=sharing)\n✦➤ [ADS LINK 2](https://linkvertise.com/1175425/mahiru-shiina-discord-bot)'
                    }
                )
                .setImage('https://cdn.discordapp.com/attachments/1323567901344792660/1367160141207699529/8d0EZ9e.gif?ex=6813929a&is=6812411a&hm=a70f14acf2d77de2956d2041dbb00dd8b4326cdc3df464a8f642c3c7c4aafc60&')
                .setFooter({ 
                    text: 'Made with ❤️ by it\'s Manish'
                });

            // Update stats and log command
            reelManager.updateStats('help', interaction.user.id);
            await logCommand(
                interaction.user,
                'help',
                'Viewed help menu',
                null
            );

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setLabel('Invite Bot')
                        .setEmoji('🔗')
                        .setStyle(ButtonStyle.Link)
                        .setURL(inviteLink),
                    new ButtonBuilder()
                        .setLabel('Support Server')
                        .setEmoji('🛠️')
                        .setStyle(ButtonStyle.Link)
                        .setURL(supportServer),
                    new ButtonBuilder()
                        .setLabel('GitHub')
                        .setEmoji('📦')
                        .setStyle(ButtonStyle.Link)
                        .setURL(githubRepo),
                    new ButtonBuilder()
                        .setLabel('YouTube')
                        .setEmoji('📺')
                        .setStyle(ButtonStyle.Link)
                        .setURL(youtubeChannel),
                    new ButtonBuilder()
                        .setLabel('Instagram')
                        .setEmoji('📸')
                        .setStyle(ButtonStyle.Link)
                        .setURL(instagramPage)
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        } catch (error) {
            console.error('Error in help command:', error);
            await interaction.reply({
                content: '❌ something wrong',
                ephemeral: true
            });
        }
    },
}; 
