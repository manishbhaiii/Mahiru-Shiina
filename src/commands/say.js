const { SlashCommandBuilder } = require('discord.js');
const gTTS = require('gtts');
const fs = require('fs');
const path = require('path');
const { logCommand } = require('../utils/webhook');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Convert text to speech')
        .addStringOption(option =>
            option.setName('text')
                .setDescription('The text to convert to speech')
                .setRequired(true)
                .setMaxLength(200))
        .addStringOption(option =>
            option.setName('language')
                .setDescription('Language to speak in (default: en)')
                .setRequired(false)
                .addChoices(
                    { name: 'English', value: 'en' },
                    { name: 'Hindi', value: 'hi' },
                    { name: 'Japanese', value: 'ja' },
                    { name: 'Spanish', value: 'es' },
                    { name: 'French', value: 'fr' },
                    { name: 'German', value: 'de' },
                    { name: 'Italian', value: 'it' },
                    { name: 'Russian', value: 'ru' },
                    { name: 'Korean', value: 'ko' },
                    { name: 'Chinese', value: 'zh' }
                )),

    async execute(interaction) {
        try {
            await interaction.deferReply();
            const text = interaction.options.getString('text');
            const lang = interaction.options.getString('language') || 'en';

            // Create temp directory if it doesn't exist
            const tempDir = path.join(__dirname, '..', 'temp');
            if (!fs.existsSync(tempDir)) {
                fs.mkdirSync(tempDir);
            }

            // Generate unique filename
            const fileName = `tts_${Date.now()}.mp3`;
            const filePath = path.join(tempDir, fileName);

            // Create gTTS instance
            const gtts = new gTTS(text, lang);

            // Convert to promise-based operation
            await new Promise((resolve, reject) => {
                gtts.save(filePath, (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });

            // Send the file
            await interaction.editReply({
                content: `🎙️ "${text}"`,
                files: [{
                    attachment: filePath,
                    name: 'Mahiru.mp3'
                }]
            });

            // Log the command
            await logCommand(
                interaction.user,
                'say',
                `Generated TTS for: ${text} (${lang})`,
                null
            );

            // Clean up the file
            fs.unlinkSync(filePath);

        } catch (error) {
            console.error('Error in say command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while converting text to speech.',
                ephemeral: true
            });
        }
    },
}; 