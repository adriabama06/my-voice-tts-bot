import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import { REST, Client, Collection, SlashCommandBuilder, Routes, ChatInputCommandInteraction, CacheType } from "discord.js";
import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface CommandRunOptions {
    client: Client<true>,
    interaction: ChatInputCommandInteraction<CacheType>
}

export interface CommandI {
    name: string,
    description: string,
    run: (options: CommandRunOptions) => Promise<void>
}

export const loadCommands = async (client: Client<true>, commands: Collection<string, CommandI>) => {
    const commandsJson = [];

    const commandsPath = path.join(__dirname, "commands");
    const commandFiles = fs.readdirSync(commandsPath).filter((file) => file.endsWith(".js"));

    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);

        const commandModule = await import(filePath);

        const command: CommandI = commandModule.default;

        if ("name" in command && "description" in command && "run" in command) {
            const slashCommand = new SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description);

            commands.set(command.name, command);

            commandsJson.push(slashCommand.toJSON());

            console.log(`[INFO] ${filePath} loaded.`);
        } else {
            console.log(`[WARNING] Can't load ${filePath}.`);
        }
    }

    const rest = new REST().setToken(config.TOKEN);

    try {
		console.log(`Started refreshing ${commandsJson.length} application (/) commands.`);

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(client.application.id),
			{ body: commands },
		) as unknown[];

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.log(`Error refreshing ${commandsJson.length} application (/) commands.`);
		console.error(error);
	}
}