# 🎥 Instagram Reels Discord Bot

<div align="center">
  <img src="https://static.myfigurecollection.net/upload/pictures/2024/03/14/3933240.jpeg" alt="Instagram Reels Bot Banner" width="600px">

  [![Discord](https://img.shields.io/discord/1270616787809206364?color=7289da&logo=discord&logoColor=white)](https://discord.gg/hZf4j8GzzK)
  [![GitHub Stars](https://img.shields.io/github/stars/manishbhaiii/Mahiru-Shiina?style=social)](https://github.com/manishbhaiii/Mahiru-Shiina/stargazers)

  *Watch Instagram Reels directly in Discord! 🚀*
</div>

## ✨ Features

- `/ig <link> [text]` - Convert Instagram reel link
- `/help` - Show help and usage information
- `/ping` - Check bot latency
- `/random` - Get a random viral reel

## 📚 Commands

| Command | Description | Usage |
|---------|-------------|--------|
| `/ig` | Convert Instagram reel link | `/ig <link> [text]` |
| `/random` | Get a random Instagram reel | `/random` |
| `/say` | Convert text to speech | `/say <text> [language]` |
| `/stats` | View bot usage statistics | `/stats` |
| `/ping` | Check bot latency & status | `/ping` |
| `/firstmsg` | Get channel's first message | `/firstmsg` |
| `/help` | Show all commands | `/help` |

## 🚀 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- Discord Bot Token
- Discord Application with proper intents enabled
  - Server Members Intent
  - Message Content Intent

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/manishbhaiii/Mahiru-Shiina.git
   cd Mahiru-Shiina
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env` file in the root directory
   ```env
   BOT_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   WEBHOOK_URL=your_webhook_url_here
   ```

4. **Deploy commands**
   ```bash
   node src/deploy-commands.js
   ```

5. **Start the bot**
   ```bash
   node src/index.js
   ```

## 🛠️ Configuration

The bot can be configured through the following files:
- `config.json`: Contains links and basic configuration
- `src/data/stats.json`: Stores usage statistics
- `.env`: Environment variables

## 🌟 Features in Detail

### Dynamic Status
The bot displays different statuses every 10 seconds:
1. "Watching /help"
2. "Made by it's manish"
3. "Watching [server count] servers | [user count] users"
4. "[command count] commands used"

### Text to Speech Languages
- English (en)
- Hindi (hi)
- Japanese (ja)
- Spanish (es)
- French (fr)
- German (de)
- Italian (it)
- Russian (ru)
- Korean (ko)
- Chinese (zh)

## 📞 Contact

- Discord: itz.manish
- Website: [https://its-manish.vercel.app](https://its-manish.vercel.app)

---
<div align="center">
  Made with ❤️ by <a href="https://github.com/manishbhaiii">it's manish</a>
</div>

