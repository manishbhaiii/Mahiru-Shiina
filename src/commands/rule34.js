const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { logCommand } = require('../utils/webhook');
const axios = require('axios');
const reelManager = require('../utils/reelManager');

// Store active searches to manage pagination
const activeSearches = new Map();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('r34')
        .setDescription('Search Rule34.xxx (NSFW only)')
        .addStringOption(option =>
            option.setName('query')
                .setDescription('Search query for Rule34.xxx')
                .setRequired(true)
        ),

    async execute(interaction) {
        try {
            const query = interaction.options.getString('query');
            
            // Check if channel is NSFW
            if (!interaction.channel.nsfw) {
                return interaction.reply({
                    content: 'use NSFW channels',
                    ephemeral: true
                });
            }

            await interaction.deferReply();

            // Log command usage
            await logCommand(
                interaction.user,
                'r34',
                `Searched Rule34.xxx with query: ${query}`,
                null
            );

            const searchResults = await searchRule34(query);
            
            console.log(`Search completed for query "${query}". Results: ${searchResults ? searchResults.length : 'null'}`);
            
            if (!searchResults || searchResults.length === 0) {
                await interaction.editReply({
                    content: `❌ No results found for query: "${query}". Try different keywords or check spelling.`
                });
                return;
            }

            // Store search results for pagination
            const searchId = `${interaction.user.id}_${Date.now()}`;
            activeSearches.set(searchId, {
                results: searchResults,
                currentIndex: 0,
                query: query,
                userId: interaction.user.id
            });

            // Clean up old searches (older than 10 minutes)
            setTimeout(() => {
                activeSearches.delete(searchId);
            }, 600000);

            const embed = createResultEmbed(searchResults[0], 0, searchResults.length, query);
            const buttons = createNavigationButtons(searchId, 0, searchResults.length);

            await interaction.editReply({ 
                embeds: [embed], 
                components: [buttons] 
            });
            
            // Update stats
            reelManager.updateStats('r34', interaction.user.id);

        } catch (error) {
            console.error('Error in r34 command:', error);
            await interaction.editReply({
                content: '❌ An error occurred while searching Rule34.xxx. Please try again.',
            });
        }
    },

    // Handler for prefix commands
    async handlePrefixCommand(message, args) {
        try {
            const query = args.join(' ');
            
            if (!query) {
                await message.reply('❌ Please provide a search query. Example: `!r34 anime`');
                return;
            }

            // Check if channel is NSFW
            if (!message.channel.nsfw) {
                await message.reply('use NSFW channels');
                return;
            }

            const loadingMsg = await message.reply('🔍 Searching Rule34.xxx...');

            // Log command usage
            await logCommand(
                message.author,
                'prefix-r34',
                `Searched Rule34.xxx with query: ${query}`,
                null
            );

            const searchResults = await searchRule34(query);
            
            console.log(`Prefix search completed for query "${query}". Results: ${searchResults ? searchResults.length : 'null'}`);
            
            if (!searchResults || searchResults.length === 0) {
                await loadingMsg.edit({
                    content: `❌ No results found for query: "${query}". Try different keywords or check spelling.`
                });
                return;
            }

            // Store search results for pagination
            const searchId = `${message.author.id}_${Date.now()}`;
            activeSearches.set(searchId, {
                results: searchResults,
                currentIndex: 0,
                query: query,
                userId: message.author.id
            });

            // Clean up old searches (older than 10 minutes)
            setTimeout(() => {
                activeSearches.delete(searchId);
            }, 600000);

            const embed = createResultEmbed(searchResults[0], 0, searchResults.length, query);
            const buttons = createNavigationButtons(searchId, 0, searchResults.length);

            await loadingMsg.edit({ 
                content: null,
                embeds: [embed], 
                components: [buttons] 
            });
            
            // Update stats
            reelManager.updateStats('prefix-r34', message.author.id);

        } catch (error) {
            console.error('Error in r34 prefix command:', error);
            await message.reply('❌ An error occurred while searching Rule34.xxx. Please try again.');
        }
    },

    // Handle button interactions
    async handleButtonInteraction(interaction) {
        const customIdParts = interaction.customId.split('_');
        const action = customIdParts[0];
        const searchId = customIdParts.slice(1).join('_'); // Rejoin in case there are multiple underscores
        
        console.log(`Button interaction: ${action}, searchId: ${searchId}`);
        console.log(`Available searches: ${Array.from(activeSearches.keys())}`);
        
        const searchData = activeSearches.get(searchId);

        if (!searchData) {
            await interaction.reply({
                content: '❌ Search session expired. Please run the command again.',
                ephemeral: true
            });
            return;
        }

        // Check if the user who clicked is the same as who initiated the search
        if (searchData.userId !== interaction.user.id) {
            await interaction.reply({
                content: '❌ You can only interact with your own searches.',
                ephemeral: true
            });
            return;
        }

        let newIndex = searchData.currentIndex;

        switch (action) {
            case 'prev':
                newIndex = newIndex > 0 ? newIndex - 1 : searchData.results.length - 1;
                break;
            case 'next':
                newIndex = newIndex < searchData.results.length - 1 ? newIndex + 1 : 0;
                break;
            case 'random':
                newIndex = Math.floor(Math.random() * searchData.results.length);
                break;
            case 'jump':
                // Ask user for page number
                await interaction.reply({
                    content: `# <:AnimeSmile:1410791465323466834>  Please enter a page number in chat (1-${searchData.results.length})`,
                    ephemeral: true
                });
                
                // Create message collector
                const filter = (m) => m.author.id === interaction.user.id && !isNaN(m.content);
                const collector = interaction.channel.createMessageCollector({ 
                    filter, 
                    time: 30000, 
                    max: 1 
                });
                
                collector.on('collect', async (m) => {
                    const pageNum = parseInt(m.content);
                    if (pageNum >= 1 && pageNum <= searchData.results.length) {
                        newIndex = pageNum - 1;
                        
                        // Update search data
                        searchData.currentIndex = newIndex;
                        activeSearches.set(searchId, searchData);
                        
                        const embed = createResultEmbed(
                            searchData.results[newIndex], 
                            newIndex, 
                            searchData.results.length, 
                            searchData.query
                        );
                        const buttons = createNavigationButtons(searchId, newIndex, searchData.results.length);
                        
                        // Update the original message
                        await interaction.message.edit({ 
                            embeds: [embed], 
                            components: [buttons] 
                        });
                        
                        // Delete user's message for clean look
                        try {
                            await m.delete();
                        } catch (error) {
                            console.log('Could not delete user message:', error.message);
                        }
                        
                        await interaction.followUp({
                            content: `# <:AsunaYay:1384777634726285373> Jumped to page ${pageNum} <:random:1411055203763097751>`,
                            ephemeral: true
                        });
                    } else {
                        await interaction.followUp({
                            content: `❌ Invalid page number. Please enter a number between 1 and ${searchData.results.length}.`,
                            ephemeral: true
                        });
                        // Delete user's invalid message
                        try {
                            await m.delete();
                        } catch (error) {
                            console.log('Could not delete user message:', error.message);
                        }
                    }
                });
                
                collector.on('end', (collected) => {
                    if (collected.size === 0) {
                        interaction.followUp({
                            content: '⏱️ Page jump timed out. Please try again.',
                            ephemeral: true
                        }).catch(() => {});
                    }
                });
                
                return; // Don't continue with normal button handling
                
            case 'save':
                try {
                    const currentResult = searchData.results[searchData.currentIndex];
                    const saveEmbed = createResultEmbed(currentResult, searchData.currentIndex, searchData.results.length, searchData.query);
                    saveEmbed.setFooter({ text: `here is your ${searchData.query}` });
                    
                    await interaction.user.send({ embeds: [saveEmbed] });
                    await interaction.reply({
                        content: '✅ Result saved to your DMs!',
                        ephemeral: true
                    });
                } catch (error) {
                    await interaction.reply({
                        content: '❌ Unable to send DM. Please check your privacy settings.',
                        ephemeral: true
                    });
                }
                return;
        }

        // Update search data
        searchData.currentIndex = newIndex;
        activeSearches.set(searchId, searchData);

        const embed = createResultEmbed(
            searchData.results[newIndex], 
            newIndex, 
            searchData.results.length, 
            searchData.query
        );
        const buttons = createNavigationButtons(searchId, newIndex, searchData.results.length);

        await interaction.update({ 
            embeds: [embed], 
            components: [buttons] 
        });
    },

    // Export for help command (this is a special command, not categorized normally)
    endpoints: {
        special: ['r34']
    }
};

// Helper function to search Rule34.xxx with authentication
async function searchRule34(query) {
    try {
        // Get credentials from environment variables
        const apiKey = process.env.RULE34_API_KEY;
        const userId = process.env.RULE34_USER_ID;
        
        if (!apiKey || !userId) {
            console.error('Missing Rule34 API credentials in environment variables');
            return [];
        }

        // Normalize query
        const encodedQuery = encodeURIComponent(query.trim());
        console.log(`Searching Rule34 for: "${query}" (encoded: "${encodedQuery}")`);

        // Build authenticated URL
        const url = `https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&tags=${encodedQuery}&limit=50&json=1&user_id=${userId}&api_key=${apiKey}`;
        console.log(`API call with authentication`);

        const response = await axios.get(url, {
            timeout: 15000,
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        console.log(`Response status: ${response.status}`);
        console.log(`Response data type: ${typeof response.data}`);

        let posts = response.data;

        // Parse JSON if it's a string
        if (typeof posts === 'string') {
            try {
                posts = JSON.parse(posts);
            } catch (parseError) {
                console.error('Failed to parse JSON response:', parseError.message);
                return [];
            }
        }

        if (!Array.isArray(posts)) {
            console.log('Response is not an array:', typeof posts);
            if (typeof posts === 'string' && posts.includes('Missing authentication')) {
                console.error('Authentication failed - check API key and user ID');
            }
            return [];
        }

        if (posts.length === 0) {
            console.log('No posts found for query');
            return [];
        }

        console.log(`Found ${posts.length} total posts`);

        // Filter valid image posts
        const validPosts = posts.filter(post => {
            const fileUrl = post.file_url;
            const isValid = fileUrl && /\.(jpg|jpeg|png|gif|webp)$/i.test(fileUrl);
            return isValid;
        });

        console.log(`Found ${validPosts.length} valid image posts`);
        
        if (validPosts.length > 0) {
            console.log(`First valid post file_url:`, validPosts[0].file_url);
        }

        // Return posts in the expected format
        return validPosts.map(post => ({
            file_url: post.file_url,
            tags: post.tags || '',
            score: post.score || 0,
            width: post.width || 'Unknown',
            height: post.height || 'Unknown',
            id: post.id || Math.random().toString()
        }));

    } catch (error) {
        console.error('Error in searchRule34:');
        console.error('Error message:', error.message);
        console.error('Error code:', error.code);
        if (error.response) {
            console.error('Error status:', error.response.status);
            console.error('Error response preview:', error.response.data?.toString().substring(0, 200));
        }
        return [];
    }
}

// Helper function to create result embed
function createResultEmbed(result, index, totalResults, query) {
    const tags = result.tags ? result.tags.split(' ').slice(0, 10).join(', ') : 'No tags';
    const truncatedTags = tags.length > 200 ? tags.substring(0, 200) + '...' : tags;
    
    return new EmbedBuilder()
        .setColor(0xF8BE36)
        .setTitle(`🔞 Rule34 Search: ${query}`)
        .setDescription(`**Result ${index + 1}/${totalResults}**`)
        .setImage(result.file_url)
        .setFooter({ 
            text: `${totalResults} results found` 
        })
        .setTimestamp();
}

// Helper function to create navigation buttons
function createNavigationButtons(searchId, currentIndex, totalResults) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`prev_${searchId}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:Previous:1411053686926479592>')
                .setDisabled(totalResults <= 1),
            new ButtonBuilder()
                .setCustomId(`next_${searchId}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:next:1411051896181100717>')
                .setDisabled(totalResults <= 1),
            new ButtonBuilder()
                .setCustomId(`random_${searchId}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:random:1411055203763097751>')
                .setDisabled(totalResults <= 1),
            new ButtonBuilder()
                .setCustomId(`jump_${searchId}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:jump:1411056390700793896>')
                .setDisabled(totalResults <= 1),
            new ButtonBuilder()
                .setCustomId(`save_${searchId}`)
                .setStyle(ButtonStyle.Secondary)
                .setEmoji('<:save:1411057455852425277>')
        );
}