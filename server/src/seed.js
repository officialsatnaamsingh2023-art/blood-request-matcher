const { Donor, BloodRequest } = require('./models');

async function seedDatabase() {
  if (await Donor.countDocuments() === 0) {
    const daysAgo = n => { const d = new Date(); d.setDate(d.getDate()-n); return d; };
    await Donor.insertMany([
      { name:'Aman Verma', email:'aman.v@example.com', phoneNumber:'9826011122', bloodGroup:'O_NEGATIVE', latitude:23.2650, longitude:77.4080, lastDonationDate:daysAgo(110), available:true },
      { name:'Rohit Sharma', email:'rohit.s@example.com', phoneNumber:'9826033344', bloodGroup:'O_POSITIVE', latitude:23.2420, longitude:77.4350, lastDonationDate:daysAgo(100), available:true },
      { name:'Priya Patel', email:'priya.p@example.com', phoneNumber:'9826055566', bloodGroup:'A_POSITIVE', latitude:23.2750, longitude:77.4110, lastDonationDate:daysAgo(30), available:true },
      { name:'Vikram Singh', email:'vikram.s@example.com', phoneNumber:'9826077788', bloodGroup:'B_POSITIVE', latitude:23.2100, longitude:77.4500, lastDonationDate:daysAgo(140), available:true },
      { name:'Neha Gupta', email:'neha.g@example.com', phoneNumber:'9826099900', bloodGroup:'AB_POSITIVE', latitude:23.2500, longitude:77.3900, lastDonationDate:null, available:true }
    ]);
  }
  if (await BloodRequest.countDocuments() === 0) {
    await BloodRequest.create({ patientName:'Rajesh Kumar', hospitalName:'City Care Multi-Speciality Hospital', requiredBloodGroup:'O_POSITIVE', unitsRequired:2, urgencyLevel:'CRITICAL', hospitalLatitude:23.2599, hospitalLongitude:77.4126, status:'OPEN' });
  }
}
module.exports = seedDatabase;
