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
- NSFW Image APIs (Nekobot, Nekosbest, Purrbot, Waifu.pics)
- Rule34 Search with pagination

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
| `/nekobot <category>` | Get images from Nekobot.xyz API (NSFW) | `/nekobot <category>` |
| `/nekosbest sfw <category>` | Get SFW anime pictures | `/nekosbest sfw <category>` |
| `/nekosbest interaction <category> <user>` | Get interaction anime pictures | `/nekosbest interaction <category> <user>` |
| `/purrbot <category>` | Get images from PurrBot API (NSFW) | `/purrbot <category>` |
| `/waifupic sfw <category>` | Get SFW anime pictures | `/waifupic sfw <category>` |
| `/waifupic interaction <category> <user>` | Get interaction anime pictures | `/waifupic interaction <category> <user>` |
| `/waifupic nsfw <category>` | Get NSFW anime pictures | `/waifupic nsfw <category>` |
| `/r34 <query>` | Search Rule34.xxx (NSFW) | `/r34 <query>` |

## 🚀 Installation

### Prerequisites
- Node.js 16.9.0 or higher
- Discord Bot Token
- Discord Application with proper intents enabled


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

4. **Start the bot**
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

### NSFW Image APIs

#### Nekobot API
Categories: hass, hmidriff, pgif, 4k, hentai, holo, hneko, neko, hkitsune, kemonomimi, anal, hanal, gonewild, kanna, ass, pussy, thigh, hthigh, gah, coffee, food, paizuri, tentacle, boobs, hboobs

#### Nekosbest API
SFW Categories: husbando, kitsune, neko2, waifu2, angry, baka, blush2, bored, cry2, dance2, happy2, laugh, lurk, nod, nom, nope, pout, run, shoot, shrug, sleep, smile2, smug2, stare, think, thumbsup, wave2, wink2, yawn

Interaction Categories: bite2, cuddle2, facepalm, feed, handhold2, handshake, highfive2, hug2, kick2, kiss2, pat2, peck, poke, punch, slap2, tickle, yeet2

#### Purrbot API
Categories: blowjob2, cum, fuck, neko3, pussylick, solo, threesome

#### Waifu.pics API
SFW Categories: waifu, neko, shinobu, megumin, awoo, smug, blush, smile, wave, happy, wink, nom

Interaction Categories: bully, cuddle, cry, hug, kiss, lick, pat, bonk, yeet, highfive, handhold, bite, glomp, slap, kill, kick

NSFW Categories: waifu, neko, trap, blowjob

### Rule34 Search
Search Rule34.xxx with pagination support. Results are displayed with navigation buttons for easy browsing.

## 📞 Contact

- Discord: itz.manish
- Website: [https://roxy-selfbot.vercel.app/](https://roxy-selfbot.vercel.app/)

---
<div align="center">
  Made with ❤️ by <a href="https://github.com/manishbhaiii">it's manish</a>
</div>