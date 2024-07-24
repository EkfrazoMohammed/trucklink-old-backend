const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ownerAdvance = new Schema({
  ownerId: { type: String, required: true },
  ownerDetails: { type: Schema.Types.ObjectId, ref: "owners", required: true },
  initialAmount: { type: Number, required: true },
  initialDate: { type: String, required: true },
  initialISODate: { type: Date, required: true },

  ledgerEntries: [
    new Schema({ 
      entryDate: { type: String, required: true }, 
      entryISODate: { type: Date, required: true },
      debit: { type: Number, required: true, default: 0 },
      credit: { type: Number, required: true, default: 0 },
      narration: { type: String, required: true }
    }),
  ],
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const OwnerAdvance = mongoose.model(
  "ownerAdvances",
  ownerAdvance,
  "ownerAdvances"
);

module.exports = OwnerAdvance;
