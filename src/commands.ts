import fs from "fs";
import { fileURLToPath } from "url";
import path, { dirname } from "path";

import { REST, Client, Collection, SlashCommandBuilder, Routes, ChatInputCommandInteraction, CacheType } from "discord.js";
import { VoiceConnection } from "@discordjs/voice";

import config from "./config.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export interface ServerOptions {
    connection: VoiceConnection | null
}

export interface CommandRunOptions {
    client: Client<true>,
    interaction: ChatInputCommandInteraction<CacheType>,
    server: ServerOptions
}

export interface CommandI {
    name: string,
    description: string,
    run: (options: CommandRunOptions) => Promise<void>,
    loadOptions?: (slashCommand: SlashCommandBuilder) => SlashCommandBuilder
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
            let slashCommand = new SlashCommandBuilder()
                .setName(command.name)
                .setDescription(command.description);

            if(command.loadOptions) {
                slashCommand = command.loadOptions(slashCommand);
            }

            commands.set(command.name, command);

            commandsJson.push(slashCommand.toJSON());

            console.log(`[INFO] ${filePath} loaded.`);
        } else {
            console.log(`[WARNING] Can't load ${filePath}.`);
        }
    }

    const rest = new REST().setToken(config.TOKEN);

    try {
		console.log(`[INFO] Started refreshing ${commandsJson.length} application (/) commands.`);

        // console.log(JSON.stringify(commandsJson, undefined, 2))

		// The put method is used to fully refresh all commands in the guild with the current set
		const data = await rest.put(
			Routes.applicationCommands(client.application.id),
			{ body: commands },
		) as unknown[];

		console.log(`[INFO] Successfully reloaded ${data.length} application (/) commands.`);
	} catch (error) {
		// And of course, make sure you catch and log any errors!
		console.log(`[WARNING] Error refreshing ${commandsJson.length} application (/) commands.`);
		console.error(error);
	}
}