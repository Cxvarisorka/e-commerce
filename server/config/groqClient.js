const Groq = require("groq-sdk");

let client;
const getGroqClients = () => {

    if (!client) {
        client = new Groq({apiKey: process.env.GROQ_API_KEY});
    }

    return client;

}

module.exports = getGroqClients