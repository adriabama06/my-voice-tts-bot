import { CommandI } from "../commands.js";

export default {
    name: "join",
    description: "Join to the current call.",
    run: async ({ interaction }) => {
        await interaction.reply(`Hello ${interaction.user.username}.`);
    }
} as CommandI;
