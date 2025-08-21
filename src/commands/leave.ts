import { GuildMember, MessageFlags } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import { CommandI } from "../commands.js";
import { Queue } from "../Queue.js";

export default {
    name: "leave",
    description: "Leave the current call.",
    run: async ({ interaction, server }) => {
        if(!interaction.guild || !interaction.channel || !interaction.member) return;

        if(!(interaction.member instanceof GuildMember)) return;

        const voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) return await interaction.reply({ content: "You must be in a voice channel!", flags: MessageFlags.Ephemeral });

        const connection = getVoiceConnection(interaction.guild.id);

        if(!connection || connection.joinConfig.channelId !== voiceChannel.id) return await interaction.reply({ content: "You must be in the same voice channel!", flags: MessageFlags.Ephemeral });

        connection.destroy();

        // Clear queue
        server.queue = new Queue();

        await interaction.reply({ content: "Ok!", flags: MessageFlags.Ephemeral });
    }
} as CommandI;
