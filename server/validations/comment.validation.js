// Modules
const { z } = require("zod");

// Schema to validate comment request body
const commentSchema = z.object({
    content: z.string().min(1).max(200)
}).strict();

module.exports = commentSchema;