const { TOKEN } = process.env;

if(!TOKEN) {
    console.log("Missing environment");

    process.exit(0);
}

export default {
    TOKEN
};
