const mongoose = require('mongoose');

const BLOOD_GROUPS = ['O_NEGATIVE','O_POSITIVE','A_NEGATIVE','A_POSITIVE','B_NEGATIVE','B_POSITIVE','AB_NEGATIVE','AB_POSITIVE'];
const URGENCY = ['CRITICAL','HIGH','MEDIUM','LOW'];
const STATUS = ['OPEN','FULFILLED','CANCELLED'];

const donorSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },
  bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
  latitude: { type: Number, required: true, min: -90, max: 90 },
  longitude: { type: Number, required: true, min: -180, max: 180 },
  lastDonationDate: { type: Date, default: null },
  available: { type: Boolean, default: true }
}, { timestamps: true });

donorSchema.index({ bloodGroup: 1, available: 1 });

const requestSchema = new mongoose.Schema({
  patientName: { type: String, required: true, trim: true },
  hospitalName: { type: String, required: true, trim: true },
  requiredBloodGroup: { type: String, enum: BLOOD_GROUPS, required: true },
  unitsRequired: { type: Number, required: true, min: 1, max: 20 },
  urgencyLevel: { type: String, enum: URGENCY, required: true },
  hospitalLatitude: { type: Number, required: true, min: -90, max: 90 },
  hospitalLongitude: { type: Number, required: true, min: -180, max: 180 },
  status: { type: String, enum: STATUS, default: 'OPEN' }
}, { timestamps: true });

requestSchema.index({ status: 1, urgencyLevel: 1, createdAt: -1 });

module.exports = {
  Donor: mongoose.model('Donor', donorSchema),
  BloodRequest: mongoose.model('BloodRequest', requestSchema),
  BLOOD_GROUPS, URGENCY, STATUS
};
