const { Events, ActivityType } = require('discord.js');
const { DefaultWebSocketManagerOptions } = require('@discordjs/ws');

// Initialize command counter for the day
let dailyCommandUses = 0;

// Status types array
const ACTIVITIES = [
    { text: '/help', type: ActivityType.Watching },
    { text: 'Made by it\'s manish', type: ActivityType.Playing },
    { text: '', type: ActivityType.Watching }, // Server count status - filled dynamically
    { text: '', type: ActivityType.Playing }   // Command count status - filled dynamically
];

// Presence types array
const PRESENCES = ['online', 'dnd', 'idle'];
let currentActivityIndex = 0;
let currentPresenceIndex = 0;

module.exports = {
    name: Events.ClientReady,
    once: true,
    execute(client) {
        console.log(`🚀 Ready! Logged in as ${client.user.tag}`);
        
        // Function to update status and presence
        function updateStatusAndPresence() {
            // Get current activity
            let activity = ACTIVITIES[currentActivityIndex];
            let statusText = activity.text;
            
            // Update dynamic statuses
            if (currentActivityIndex === 2) {
                statusText = `${client.guilds.cache.size} servers | ${client.users.cache.size} users`;
            } else if (currentActivityIndex === 3) {
                statusText = `${dailyCommandUses} commands used`;
            }

            // Set the activity
            client.user.setActivity(statusText, { type: activity.type });

            // Set presence
            if (currentPresenceIndex === PRESENCES.length) {
                // Set mobile presence
                DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord iOS';
                client.user.setStatus('online');
            } else {
                // Set regular presence
                DefaultWebSocketManagerOptions.identifyProperties.browser = 'Discord Client';
                client.user.setStatus(PRESENCES[currentPresenceIndex]);
            }

            // Update indices
            currentActivityIndex = (currentActivityIndex + 1) % ACTIVITIES.length;
            currentPresenceIndex = (currentPresenceIndex + 1) % (PRESENCES.length + 1); // +1 for mobile presence
        }

        // Initial update
        updateStatusAndPresence();

        // Set interval for updates
        setInterval(updateStatusAndPresence, 10000);

        // Reset daily command counter at midnight
        function resetDailyStats() {
            const now = new Date();
            const midnight = new Date(now);
            midnight.setHours(24, 0, 0, 0);
            const timeUntilMidnight = midnight - now;

            setTimeout(() => {
                dailyCommandUses = 0;
                // Set up the next day's reset
                setInterval(resetDailyStats, 24 * 60 * 60 * 1000);
            }, timeUntilMidnight);
        }

        // Start the daily reset cycle
        resetDailyStats();

        // Track command usage
        client.on('interactionCreate', (interaction) => {
            if (interaction.isChatInputCommand()) {
                dailyCommandUses++;
            }
        });
    },
}; 