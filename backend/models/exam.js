const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    spreadsheetId: {
      type: String, // Store the Google Spreadsheet ID
      required: true,
    },
    sheetName: {
      type: String, // Store the sheet name (e.g., "Sheet1")
      required: true,
    },
    scheduledFrom : {type : Date},
    scheduledTo : {type : Date},
    questions: [
      {
        question: {
          type: String,
          required: true,
        },
        options: [
          {
            type: String,
            required: true,
          },
        ],
        correctAnswer: {
          type: String,
          required: true,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users', // Assuming you have a User model for the admin
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['Pending', 'Active', 'Completed'],
      default: 'Pending', // Default status is "Pending"
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Exam', examSchema);
