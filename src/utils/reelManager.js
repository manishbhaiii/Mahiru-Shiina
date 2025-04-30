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
                igUsage: 0,
                randomUsage: 0,
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
                igUsage: 0,
                randomUsage: 0,
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
                    igUsage: parsedStats.dailyStats.igUsage || 0,
                    randomUsage: parsedStats.dailyStats.randomUsage || 0,
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
            igUsage: 0,
            randomUsage: 0,
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

        if (commandName === 'ig') {
            this.stats.dailyStats.igUsage++;
        } else if (commandName === 'random') {
            this.stats.dailyStats.randomUsage++;
        }

        this.saveData();
    }

    getDailyStats() {
        this.checkDailyReset();
        return {
            igUsage: this.stats.dailyStats.igUsage,
            randomUsage: this.stats.dailyStats.randomUsage,
            uniqueUsers: this.stats.dailyStats.uniqueUsers.size,
            totalCommands: this.stats.dailyStats.totalCommands
        };
    }
}

module.exports = new ReelManager(); 