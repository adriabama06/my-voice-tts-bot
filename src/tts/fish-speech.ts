import { readFileSync, writeFileSync } from "fs";

import { encode } from "@msgpack/msgpack";
import { v4 as uuid_v4 } from "uuid";

import config from "../config.js";

interface FishSpeechReferenceAudio {
    audio: string,
    text: string
};

interface FishSpeechData {
    text: string,
    references?: FishSpeechReferenceAudio[];
    reference_id?: string,
    format: "wav" | "mp3" | "flac",
    max_new_tokens: number,
    chunk_length: number,
    top_p: number,
    repetition_penalty: number,
    temperature: number,
    streaming: boolean,
    use_memory_cache: "on" | "off",
    normalize: boolean,
    seed: number | undefined
};

const FishSpeechDataDefault = (): FishSpeechData => ({
    text: "",
    format: "wav",
    max_new_tokens: 1024,
    chunk_length: 300,
    top_p: 0.8,
    repetition_penalty: 1.1,
    temperature: 0.8,
    streaming: false,
    use_memory_cache: "off",
    normalize: true,
    seed: undefined
});

const FishSpeechInference = async (data: FishSpeechData): Promise<ArrayBuffer> => {
    const body = encode(data);

    const response = await fetch(config.TTS_URL, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${config.TTS_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data)
    });

    if (!response.ok) {
        console.log(await response.text());
        process.exit(0);
    }

    return await response.arrayBuffer();
};

export const FishSpeechGenerateAudio = async (text: string, audioFile: string, audioFileText: string): Promise<string | null> => {
    const audioBuffer = readFileSync(audioFile);
    const audioData = audioBuffer.toString("base64");

    const audioText = readFileSync(audioFileText, "utf-8");

    const data: FishSpeechData = {
        ...FishSpeechDataDefault(),
        text: text,
        references: [
            {
                audio: audioData,
                text: audioText
            }
        ],
        format: "wav"
    };

    try {
        const audio = await FishSpeechInference(data);

        const outputFileName = `${uuid_v4()}.wav`;
        writeFileSync(outputFileName, Buffer.from(audio));
        
        return outputFileName;
    } catch (err) {
        console.log(err);

        return null;
    }
};
