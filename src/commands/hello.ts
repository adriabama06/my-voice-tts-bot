import { CommandI } from "../commands.js";

export default {
    name: "hello",
    description: "Say hello",
    run: async ({ interaction }) => {
        await interaction.reply(`Hello ${interaction.user.username}.`);
    }
} as CommandI;
