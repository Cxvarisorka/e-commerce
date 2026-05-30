// Modules
const { z } = require("zod");

// Schema to validate review request body
const reviewSchema = z.object({
    rating: z.number().min(1).max(5),
    comment: z.string().min(5).max(200)
}).strict();

module.exports = { reviewSchema };
