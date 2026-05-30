// Modules
const { z } = require("zod");

// Schema to validate signup request body property
const registerSchema = z.object({
    fullname: z.string().min(3).max(30),
    email: z.email(),
    password: z.string().min(8).max(50)
}).strict();

// Schema to validate signin request body property
const loginSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(50) 
}).strict();

module.exports = { registerSchema, loginSchema };