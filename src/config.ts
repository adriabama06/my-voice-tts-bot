const { TOKEN,
    TTS_KEY, TTS_URL,
    STT_KEY, STT_BASEURL } = process.env;

if(!TOKEN || !TTS_KEY || !TTS_URL || !STT_KEY || !STT_BASEURL) {
    console.log("[WARNING] Missing environment");

    process.exit(0);
}

export default {
    TOKEN,
    TTS_KEY, TTS_URL,
    STT_KEY, STT_BASEURL
};
