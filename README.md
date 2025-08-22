# My Voice TTS Bot

A Discord bot that uses your voice to generate text-to-speech (TTS) audio. The bot listens to messages in a voice channel and converts them to speech using a voice cloned from your own voice samples.

## How It Works

1. Users provide a voice sample by recording themselves speaking
2. The bot uses this sample to clone the user's voice
3. When users send text messages in a voice channel, the bot converts them to speech using the cloned voice
4. The bot joins voice channels and reads out the messages in real-time

## Prerequisites

Before setting up the bot, ensure you have the following installed:
- Node.js (v22 or higher)
- npm
- Docker and Docker Compose
- FFmpeg

On Ubuntu/Debian systems, you may need to install additional dependencies (https://www.npmjs.com/package/sodium#install):
```bash
sudo apt-get install libtool-bin ffmpeg
```

## Setup

### 1. Discord Bot Setup

1. Go to the [Discord Developer Portal](https://discord.com/developers/applications)
2. Create a new application
3. Navigate to the "Bot" section and create a bot
4. Copy the bot token - you'll need it later
5. Enable the following intents under "Privileged Gateway Intents":
   - MESSAGE CONTENT INTENT
   - SERVER MEMBERS INTENT

### 2. Environment Configuration

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # Discord bot token from the Developer Portal
   TOKEN=your_discord_bot_token_here

   # TTS Service Configuration
   TTS_KEY=your_tts_api_key  # Can be any value for local setup
   TTS_URL=http://localhost:6673/v1/tts

   # STT Service Configuration (for voice cloning)
   STT_KEY=your_openai_api_key_or_custom_key
   STT_BASEURL=https://api.openai.com/v1  # Or your custom STT service URL
   ```

### 3. Voice Services Setup

This bot requires two services for voice processing:
1. TTS (Text-to-Speech) service using OpenAudio-S1-Mini
2. STT (Speech-to-Text) service using Whisper

Start both services using Docker Compose:
```bash
docker-compose up -d
```

This will start:
- OpenAudio-S1-Mini TTS service on port 6673
- Whisper STT service on port 6674

### 4. Install Dependencies

```bash
npm install
```

### 5. Build the Project

```bash
npm run build
```

## Usage

### 1. Start the Bot

```bash
npm start
```

### 2. In Discord

1. Join a voice channel
2. Use the `/join` command to have the bot join your voice channel
3. Provide a voice sample by recording yourself (saved as `samples/YOUR_USER_ID.wav`)
4. Send text messages in any channel while in the voice channel
5. The bot will convert your messages to speech using your cloned voice

### Available Commands

- `/join` - Joins the user's current voice channel
- `/leave` - Leaves the current voice channel
- `/load` - Loads a voice sample (instructions provided by the bot)
- `/hello` - Test command to verify the bot is working

## Voice Sample Requirements

To use the voice cloning feature:

1. Record yourself speaking clearly for about 30 seconds
2. Save the recording as `samples/YOUR_DISCORD_USER_ID.wav` in WAV format
3. The bot will automatically transcribe this sample using the STT service
4. The transcription is used as a reference for voice cloning

## Services Architecture

- **OpenAudio-S1-Mini**: Provides the TTS functionality for voice cloning
- **Whisper**: Provides the STT functionality for transcribing voice samples
- **Discord.js**: Handles Discord bot interactions and voice connections

## Configuration

### Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `TOKEN` | Discord bot token | `XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `TTS_KEY` | API key for TTS service | `any_string_for_local` |
| `TTS_URL` | URL for TTS service | `http://localhost:6673/v1/tts` |
| `STT_KEY` | API key for STT service | `sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX` |
| `STT_BASEURL` | Base URL for STT service | `https://api.openai.com/v1` |

## Troubleshooting

### Common Issues

1. **Bot doesn't join voice channel**
   - Ensure the bot has proper permissions in your server
   - Check that all required intents are enabled in the Discord Developer Portal

2. **Voice not generating**
   - Verify your voice sample exists in the `samples/` directory
   - Check that both Docker services are running properly
   - Ensure the `.env` file is properly configured

3. **Docker services not starting**
   - Make sure you have NVIDIA Docker runtime installed if using GPU acceleration
   - Check Docker logs: `docker-compose logs`

### Checking Service Status

```bash
# Check if services are running
docker-compose ps

# View service logs
docker-compose logs openaudio-s1-mini
docker-compose logs whisper
```

## Development

### Project Structure

```
src/
├── commands/          # Discord slash commands
├── stt/               # Speech-to-text implementation
├── tts/               # Text-to-speech implementation
├── config.ts          # Configuration loader
├── index.ts           # Main bot entry point
├── commands.ts        # Command loader
├── voiceWorker.ts     # Voice processing worker
├── Queue.ts           # Message queue implementation
└── sleep.ts           # Utility function
```

### Building

```bash
# Compile TypeScript to JavaScript
npm run build

# Start the bot (builds and runs)
npm start
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
