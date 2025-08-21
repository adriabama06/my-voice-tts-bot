import { GuildMember, MessageFlags } from "discord.js";
import { getVoiceConnection, joinVoiceChannel } from "@discordjs/voice";

import { CommandI } from "../commands.js";

export default {
    name: "join",
    description: "Join to the current call.",
    run: async ({ interaction }) => {
        if(!interaction.guild || !interaction.channel || !interaction.member) return;

        if(!(interaction.member instanceof GuildMember)) return;

        const voiceChannel = interaction.member.voice.channel;

        if(!voiceChannel) return await interaction.reply({ content: "You must be in a voice channel!", flags: MessageFlags.Ephemeral });

        const connection = getVoiceConnection(interaction.guild.id);

        if(connection && connection.joinConfig.channelId === voiceChannel.id) return await interaction.reply({ content: "I'm already in the same voice channel!", flags: MessageFlags.Ephemeral });

        if(connection) connection.destroy();

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator
        });

        await interaction.reply({ content: "Ok!", flags: MessageFlags.Ephemeral });
    }
} as CommandI;
