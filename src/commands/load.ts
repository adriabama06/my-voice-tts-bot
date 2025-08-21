import { spawn } from "child_process";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { CommandI } from "../commands.js";
import { Attachment, MessageFlags } from "discord.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default {
    name: "load",
    description: "Load your voice, try to send your best audio.",
    run: async ({ interaction }) => {
        await interaction.reply({ content: "Please send a audio.", flags: MessageFlags.Ephemeral });

        const audio = await new Promise<Attachment | null>(async (resolve) => {
            if(!interaction.channel || !interaction.channel.isSendable() || !interaction.channel.isTextBased()) return resolve(null);

            const collector = interaction.channel.createMessageCollector({
                filter: (msg) => msg.attachments.size > 0,
                time: 3 * 60 * 1000
            });

            collector.on("collect", async (collect) => {
                const attach = collect.attachments.first();

                if(!attach || !attach.contentType || !["audio/x-wav", "audio/wav", "audio/aac", "audio/mpeg", "audio/ogg", "audio/webm"].includes(attach.contentType)) { console.log(attach?.contentType); return; }

                collector.stop("completed");

                resolve(attach);
            });

            collector.once("end", async (collected, reason) => {
                if(reason !== "completed") resolve(null);
            });
        });

        if(!audio) return await interaction.followUp({ content: "Timeout! Try again.", flags: MessageFlags.Ephemeral });

        console.log(audio.url);

        await new Promise<void>((resolve, reject) => {
            const args: string[] = [
                "-hide_banner",
                "-i", audio.url,
                "-map", "0:a:0", // only pick the first track of audio
                "-y", path.join(__dirname, "..", "..", "samples", `${interaction.user.id}.wav`)
            ];

            const ff = spawn("ffmpeg", args);

            // ff.stderr.on("data", (d) => {
            //     // console.log(String(d));
            // });

            ff.on("error", async (err) => {
                await interaction.followUp({ content: "Error saving your audio!", flags: MessageFlags.Ephemeral });

                console.error(err);

                resolve();
            });

            ff.on("close", async (code) => {
                if (code === 0) await interaction.followUp({ content: "Your audio has been saved successfully!", flags: MessageFlags.Ephemeral });
                else await interaction.followUp({ content: "Error saving your audio!", flags: MessageFlags.Ephemeral });
            });
        });
    }
} as CommandI;
