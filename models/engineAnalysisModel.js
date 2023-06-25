const { Schema, model } = require("mongoose");

const EngineAnalysisSchema = new Schema({
    game: { type: Schema.Types.ObjectId, ref: 'Game' },
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    gameAnalysis: { type: String, required: true },
});

module.exports = model("EngineAnalysis", EngineAnalysisSchema);