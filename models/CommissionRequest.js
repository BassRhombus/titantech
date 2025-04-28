const mongoose = require('mongoose');

const commissionSchema = new mongoose.Schema({
  discordUsername: { type: String, required: true },
  email: String,
  botType: { type: String, required: true },
  botDescription: { type: String, required: true },
  budget: Number,
  timeframe: String,
  submittedAt: { type: Date, default: Date.now },
  status: { type: String, default: 'pending' }
});

module.exports = mongoose.model('CommissionRequest', commissionSchema);
