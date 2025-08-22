const { TOKEN, TTS_KEY, TTS_URL } = process.env;

if(!TOKEN || !TTS_KEY || !TTS_URL) {
    console.log("[WARNING] Missing environment");

    process.exit(0);
}

export default {
    TOKEN,
    TTS_KEY,
    TTS_URL
};
