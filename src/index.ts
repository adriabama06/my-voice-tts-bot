import { Client, Collection, Events, GatewayIntentBits, MessageFlags, SlashCommandBuilder } from "discord.js";

import config from "./config.js";
import { CommandI, loadCommands } from "./commands.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers
    ]
});

const commands = new Collection<string, CommandI>();

client.once(Events.ClientReady, async (readyClient) => {
    console.log(`Client ready - ${readyClient.user.username}`);

    // Add commands
    loadCommands(readyClient, commands);
});

client.on(Events.InteractionCreate, async (interaction) => {
	if (!interaction.isChatInputCommand()) return;

	const command = commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.run({ client: interaction.client, interaction });
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
		} else {
			await interaction.reply({ content: "There was an error while executing this command!", flags: MessageFlags.Ephemeral });
		}
	}
});

client.login(config.TOKEN);
