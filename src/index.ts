import { Client, Collection, Events, GatewayIntentBits, GuildMember, MessageFlags, SlashCommandBuilder } from "discord.js";
import { getVoiceConnection } from "@discordjs/voice";

import config from "./config.js";
import { CommandI, loadCommands, ServerOptions } from "./commands.js";
import { Queue } from "./Queue.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.DirectMessages
    ]
});

const commands = new Collection<string, CommandI>();

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`[INFO] Client ready - ${readyClient.user.username}`);

    // Add commands
    loadCommands(readyClient, commands);
});

const serversOptions = new Map<string, ServerOptions>();

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    if(!serversOptions.has(interaction.guild.id)) serversOptions.set(interaction.guild.id, { queue: new Queue() });

    try {
        await command.run({ client: interaction.client, interaction, server: serversOptions.get(interaction.guild.id) as ServerOptions });
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        }
    }
});

// Add exception for load command
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || interaction.commandName !== "load") return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        await command.run({ client: interaction.client, interaction, server: {} as ServerOptions });
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        }
    }
});

client.on(Events.MessageCreate, async (message) => {
    if(message.author.id === message.client.user.id) return;

    if(!message.guild || !message.channel || !message.member) return;

    if(!(message.member instanceof GuildMember)) return;

    const voiceChannel = message.member.voice.channel;

    if(!voiceChannel) return

    const connection = getVoiceConnection(message.guild.id);

    if(!connection || connection.joinConfig.channelId !== voiceChannel.id) return;

    if(!serversOptions.has(message.guild.id)) serversOptions.set(message.guild.id, { queue: new Queue() });

    const server = serversOptions.get(message.guild.id) as ServerOptions;

    server.queue.push({ userId: message.author.id, content: message.content });
});

client.login(config.TOKEN);
