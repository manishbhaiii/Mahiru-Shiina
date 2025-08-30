const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');

// Define paths
const DATA_DIR = path.join(__dirname, '../data');
const REELS_FILE = path.join(DATA_DIR, 'reels.json');
const STATS_FILE = path.join(DATA_DIR, 'stats.json');

// Ensure data directory exists
if (!fsSync.existsSync(DATA_DIR)) {
    fsSync.mkdirSync(DATA_DIR, { recursive: true });
}

// Initialize files if they don't exist
function initializeFiles() {
    // Initialize reels.json
    if (!fsSync.existsSync(REELS_FILE)) {
        fsSync.writeFileSync(REELS_FILE, JSON.stringify({ reels: [] }, null, 2));
    }

    // Initialize stats.json
    if (!fsSync.existsSync(STATS_FILE)) {
        fsSync.writeFileSync(STATS_FILE, JSON.stringify({
            lastReset: new Date().toISOString(),
            dailyStats: {
                // Original commands
                igUsage: 0,
                randomUsage: 0,
                // New API commands
                waifupicUsage: 0,
                nekobotUsage: 0,
                nekosBestUsage: 0,
                purrBotUsage: 0,
                rule34Usage: 0,
                // Other commands
                helpUsage: 0,
                statsUsage: 0,
                otherUsage: 0,
                // Global stats
                uniqueUsers: [],
                totalCommands: 0
            }
        }, null, 2));
    }
}

// Initialize files before anything else
initializeFiles();

class ReelManager {
    constructor() {
        this.reels = [];
        this.stats = {
            lastReset: new Date(),
            dailyStats: {
                // Original commands
                igUsage: 0,
                randomUsage: 0,
                // New API commands
                waifupicUsage: 0,
                nekobotUsage: 0,
                nekosBestUsage: 0,
                purrBotUsage: 0,
                rule34Usage: 0,
                // Other commands
                helpUsage: 0,
                statsUsage: 0,
                otherUsage: 0,
                // Global stats
                uniqueUsers: new Set(),
                totalCommands: 0
            }
        };
        this.loadData();
    }

    async loadData() {
        try {
            // Read reels data
            const reelsData = await fs.readFile(REELS_FILE, 'utf8');
            this.reels = JSON.parse(reelsData).reels;

            // Read stats data
            const statsData = await fs.readFile(STATS_FILE, 'utf8');
            const parsedStats = JSON.parse(statsData);
            
            this.stats = {
                lastReset: new Date(parsedStats.lastReset),
                dailyStats: {
                    // Original commands
                    igUsage: parsedStats.dailyStats.igUsage || 0,
                    randomUsage: parsedStats.dailyStats.randomUsage || 0,
                    // New API commands
                    waifupicUsage: parsedStats.dailyStats.waifupicUsage || 0,
                    nekobotUsage: parsedStats.dailyStats.nekobotUsage || 0,
                    nekosBestUsage: parsedStats.dailyStats.nekosBestUsage || 0,
                    purrBotUsage: parsedStats.dailyStats.purrBotUsage || 0,
                    rule34Usage: parsedStats.dailyStats.rule34Usage || 0,
                    // Other commands
                    helpUsage: parsedStats.dailyStats.helpUsage || 0,
                    statsUsage: parsedStats.dailyStats.statsUsage || 0,
                    otherUsage: parsedStats.dailyStats.otherUsage || 0,
                    // Global stats
                    uniqueUsers: new Set(parsedStats.dailyStats.uniqueUsers || []),
                    totalCommands: parsedStats.dailyStats.totalCommands || 0
                }
            };

            // Check if we need to reset daily stats
            this.checkDailyReset();
        } catch (error) {
            console.error('Error loading data:', error);
            // Reinitialize files if there's an error
            initializeFiles();
        }
    }

    async saveData() {
        try {
            await fs.writeFile(REELS_FILE, JSON.stringify({ reels: this.reels }, null, 2));
            await fs.writeFile(STATS_FILE, JSON.stringify({
                lastReset: this.stats.lastReset.toISOString(),
                dailyStats: {
                    ...this.stats.dailyStats,
                    uniqueUsers: Array.from(this.stats.dailyStats.uniqueUsers)
                }
            }, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
    }

    checkDailyReset() {
        const now = new Date();
        const lastReset = this.stats.lastReset;
        
        if (now.getDate() !== lastReset.getDate() || 
            now.getMonth() !== lastReset.getMonth() || 
            now.getFullYear() !== lastReset.getFullYear()) {
            this.resetDailyStats();
        }
    }

    resetDailyStats() {
        this.stats.lastReset = new Date();
        this.stats.dailyStats = {
            // Original commands
            igUsage: 0,
            randomUsage: 0,
            // New API commands
            waifupicUsage: 0,
            nekobotUsage: 0,
            nekosBestUsage: 0,
            purrBotUsage: 0,
            rule34Usage: 0,
            // Other commands
            helpUsage: 0,
            statsUsage: 0,
            otherUsage: 0,
            // Global stats
            uniqueUsers: new Set(),
            totalCommands: 0
        };
        this.saveData();
    }

    async addReel(reelId) {
        if (!this.reels.includes(reelId)) {
            this.reels.push(reelId);
            await this.saveData();
        }
    }

    getRandomReel() {
        if (this.reels.length === 0) return null;
        return this.reels[Math.floor(Math.random() * this.reels.length)];
    }

    updateStats(commandName, userId) {
        this.checkDailyReset();
        
        this.stats.dailyStats.totalCommands++;
        this.stats.dailyStats.uniqueUsers.add(userId);

        // Categorize commands
        if (commandName === 'ig') {
            this.stats.dailyStats.igUsage++;
        } else if (commandName === 'random') {
            this.stats.dailyStats.randomUsage++;
        } else if (commandName.includes('waifu') || commandName.includes('waifupic') || 
                   ['neko', 'shinobu', 'megumin', 'awoo', 'smug', 'blush', 'smile', 'wave', 'happy', 'wink', 'nom',
                    'bully', 'cuddle', 'cry', 'hug', 'kiss', 'lick', 'pat', 'bonk', 'yeet', 'highfive', 'handhold', 
                    'bite', 'glomp', 'slap', 'kill', 'kick', 'trap', 'blowjob'].includes(commandName.replace('prefix-', ''))) {
            this.stats.dailyStats.waifupicUsage++;
        } else if (commandName.includes('nekobot') || 
                   ['hass', 'hmidriff', 'pgif', 'gonewild', '4k', 'hentai', 'holo', 'hkitsune'].includes(commandName.replace('prefix-', ''))) {
            this.stats.dailyStats.nekobotUsage++;
        } else if (commandName.includes('nekosbest') || 
                   ['husbando', 'kitsune', 'neko2', 'waifu2', 'angry', 'baka', 'blush2', 'bored', 'cry2', 'dance2', 
                    'happy2', 'laugh', 'lurk', 'nod', 'nope', 'pout', 'run', 'shoot', 'shrug', 'sleep', 'smile2', 
                    'smug2', 'stare', 'think', 'thumbsup', 'wave2', 'wink2', 'yawn', 'bite2', 'cuddle2', 'facepalm', 
                    'feed', 'handhold2', 'handshake', 'highfive2', 'hug2', 'kick2', 'kiss2', 'pat2', 'peck', 'poke', 
                    'punch', 'slap2', 'tickle', 'yeet2'].includes(commandName.replace('prefix-', ''))) {
            this.stats.dailyStats.nekosBestUsage++;
        } else if (commandName.includes('purrbot') || 
                   ['anal', 'blowjob', 'cum', 'fuck', 'neko3', 'pussylick', 'sex', 'threesome_fff', 
                    'threesome_ffm', 'threesome_mmf', 'yaoi'].includes(commandName.replace('prefix-', ''))) {
            this.stats.dailyStats.purrBotUsage++;
        } else if (commandName.includes('r34') || commandName.includes('rule34')) {
            this.stats.dailyStats.rule34Usage++;
        } else if (commandName.includes('help')) {
            this.stats.dailyStats.helpUsage++;
        } else if (commandName === 'stats') {
            this.stats.dailyStats.statsUsage++;
        } else {
            this.stats.dailyStats.otherUsage++;
        }

        this.saveData();
    }

    getDailyStats() {
        this.checkDailyReset();
        return {
            // Original commands
            igUsage: this.stats.dailyStats.igUsage,
            randomUsage: this.stats.dailyStats.randomUsage,
            // New API commands
            waifupicUsage: this.stats.dailyStats.waifupicUsage,
            nekobotUsage: this.stats.dailyStats.nekobotUsage,
            nekosBestUsage: this.stats.dailyStats.nekosBestUsage,
            purrBotUsage: this.stats.dailyStats.purrBotUsage,
            rule34Usage: this.stats.dailyStats.rule34Usage,
            // Other commands
            helpUsage: this.stats.dailyStats.helpUsage,
            statsUsage: this.stats.dailyStats.statsUsage,
            otherUsage: this.stats.dailyStats.otherUsage,
            // Global stats
            uniqueUsers: this.stats.dailyStats.uniqueUsers.size,
            totalCommands: this.stats.dailyStats.totalCommands
        };
    }
}

module.exports = new ReelManager(); 