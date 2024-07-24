const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cashBooks = new Schema({
  entryDate: { type: String, required: true },
  entryISODate: { type: Date, required: true },
  monthISODate: { type: Date, required: true },
  debit: { type: Number, required: true, default: 0 },
  credit: { type: Number, required: true, default: 0 },
  narration: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  modifiedAt: { type: Date, default: Date.now },
});

const DailyCashBook = mongoose.model("cashBooks", cashBooks, "cashBooks");

module.exports = DailyCashBook;
