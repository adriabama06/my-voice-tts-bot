import { createReadStream } from "fs";
import OpenAI from "openai";
import config from "../config.js";

export const whipserTranscribe = async (audioFilePath: string): Promise<string | null> => {
    const client = new OpenAI({
        apiKey: config.STT_KEY,
        baseURL: config.STT_BASEURL
    });

    try {
        const transcription = await client.audio.transcriptions.create({
            file: createReadStream(audioFilePath),
            model: "whisper-1",
            response_format: "text",
            temperature: 0
        });

        return transcription.replace(/\n/g, " ").replace(/\s+/g, " ").trim();
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return null;
    }
};
