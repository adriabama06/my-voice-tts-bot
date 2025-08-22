import { existsSync, unlinkSync } from "fs";
import { Readable } from "stream";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { createAudioPlayer, createAudioResource, getVoiceConnection, StreamType } from "@discordjs/voice";

import { ServerOptions } from "./commands.js";
import sleep from "./sleep.js";
import { Client } from "discord.js";
import { FishSpeechGenerateAudio } from "./tts/fish-speech.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const generateAudio = async (text: string, samplePath: string) => {
    const output = await FishSpeechGenerateAudio(text, samplePath, samplePath + ".txt");

    return output ? Readable.from(Buffer.from(output)) : null;
};

export const startVoiceWorker = async (client: Client<true>, guildId: string, server: ServerOptions) => {
    let connection = getVoiceConnection(guildId);

    await sleep((connection?.ping.ws ?? 250) * 4);

    if (!connection || !connection.joinConfig.channelId) return;

    let voiceChannel = await client.channels.fetch(connection.joinConfig.channelId);

    if (!voiceChannel || !voiceChannel.isVoiceBased()) return;

    const player = createAudioPlayer();

    connection.subscribe(player);

    for (; connection && voiceChannel.isVoiceBased() && voiceChannel.members.size > 1; connection = getVoiceConnection(guildId)) {
        if (server.queue.empty()) { await sleep(100); continue; }

        const element = server.queue.front();

        if (!element || !existsSync(path.join(__dirname, "..", "samples", `${element.userId}.wav`))) { server.queue.pop(); continue; }

        const audioFilePath = path.join(__dirname, "..", "samples", `${element.userId}.wav`);

        const audio = await generateAudio(element.content, audioFilePath);

        server.queue.pop();

        if (!audio) continue;

        const resource = createAudioResource(audio);

        player.play(resource);

        await new Promise<void>(async (resolve) => {
            resource.playStream.once("end", () => {
                resolve();
            });
        });
    }

    if (connection) {
        connection.destroy();
    }

    console.log("end");
};
