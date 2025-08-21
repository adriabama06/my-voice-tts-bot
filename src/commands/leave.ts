import { CommandI } from "../commands.js";

export default {
    name: "leave",
    description: "Leave the current call.",
    run: async ({ interaction }) => {
        await interaction.reply(`Hello ${interaction.user.username}.`);
    }
} as CommandI;
