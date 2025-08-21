import { existsSync, unlinkSync } from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import { v4 as uuid_v4 } from "uuid";

import { createAudioPlayer, createAudioResource, getVoiceConnection } from "@discordjs/voice";

import { ServerOptions } from "./commands.js";
import sleep from "./sleep.js";
import { Client } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TODO: Change from file to a redable.
const generateAudio = (text: string, samplePath: string): string => {
    return `${uuid_v4()}.wav`;
};

export const startVoiceWorker = async (client: Client<true>, guildId: string, server: ServerOptions) => {
    let connection = getVoiceConnection(guildId);

    await sleep((connection?.ping.ws ?? 250) * 4);

    if(!connection || !connection.joinConfig.channelId) return;
    
    let voiceChannel = await client.channels.fetch(connection.joinConfig.channelId);

    if(!voiceChannel || !voiceChannel.isVoiceBased()) return;

    const player = createAudioPlayer();

    connection.subscribe(player);

    for(;connection && voiceChannel.isVoiceBased() && voiceChannel.members.size > 1; connection = getVoiceConnection(guildId)) {
        if(server.queue.empty()) { await sleep(100); continue; }

        const element = server.queue.front();

        if(!element || !existsSync(path.join(__dirname, "..", "samples", `${element.userId}.wav`))) { server.queue.pop(); continue;}

        const audioFilePath = path.join(__dirname, "..", "samples", `${element.userId}.wav`);

        const audio = generateAudio(element.content, audioFilePath);

        console.log(element.content, audioFilePath, audio);

        server.queue.pop();

        await sleep(5000);

        continue;

        const resource = createAudioResource(audio);

        player.play(resource);

        await new Promise<void>(async (resolve) => {
            resource.playStream.once("end", () => {
                unlinkSync(audio);
                resolve();
            });
        });
    }

    if(connection) {
        connection.destroy();
    }

    console.log("end");
};
