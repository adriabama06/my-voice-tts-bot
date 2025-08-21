import { Client, Collection, Events, GatewayIntentBits, MessageFlags, SlashCommandBuilder } from "discord.js";

import config from "./config.js";
import { CommandI, loadCommands, ServerOptions } from "./commands.js";

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

const serverOptions = new Map<string, ServerOptions>();

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand() || !interaction.guild) return;

    const command = commands.get(interaction.commandName);

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    if(!serverOptions.has(interaction.guild.id)) serverOptions.set(interaction.guild.id, { connection: null });

    try {
        await command.run({ client: interaction.client, interaction, server: serverOptions.get(interaction.guild.id) as ServerOptions });
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        } else {
            await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
        }
    }
});

// client.on(Events.MessageCreate, async (message) => {
//     console.log("Message", message);
// });

client.login(config.TOKEN);
