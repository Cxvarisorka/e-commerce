const getGroqClient = require("../config/groqClient");
const { buildProductPrompt } = require("../prompts/productPrompt");

const validateProduct = async ( title, description, price ) => {

    try {
        // this will create user document in groq api like user accounte for every user
        const groq = getGroqClient();
        // this is buildProductPrompt function that will create the prompt for product if product is valid by its name and description
        const prompt = buildProductPrompt(title, description, price );

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile", // llama 3.3 model is default model for groq free AI API
            max_tokens: 1000,
            temperature: 0.1,       // low temp = consistent JSON output
            messages: [
            { role: "system", content: prompt.system },
            { role: "user",   content: prompt.user },
            ],
        });

        const text = response.choices[0].message.content ?? "";
        const clean = text.replace(/```json|```/g, "").trim();
        return JSON.parse(clean);
    } catch(err) {
        console.error("AI validation error:", err);
    }



};

module.exports = { validateProduct };