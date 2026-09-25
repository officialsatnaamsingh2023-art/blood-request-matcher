const COOLDOWN_DAYS = Number(process.env.COOLDOWN_DAYS || 90);

function normalizeGroup(group) { return String(group || '').toUpperCase(); }

function isCompatible(donor, recipient) {
  donor = normalizeGroup(donor); recipient = normalizeGroup(recipient);
  const matrix = {
    O_NEGATIVE: ['O_NEGATIVE','O_POSITIVE','A_NEGATIVE','A_POSITIVE','B_NEGATIVE','B_POSITIVE','AB_NEGATIVE','AB_POSITIVE'],
    O_POSITIVE: ['O_POSITIVE','A_POSITIVE','B_POSITIVE','AB_POSITIVE'],
    A_NEGATIVE: ['A_NEGATIVE','A_POSITIVE','AB_NEGATIVE','AB_POSITIVE'],
    A_POSITIVE: ['A_POSITIVE','AB_POSITIVE'],
    B_NEGATIVE: ['B_NEGATIVE','B_POSITIVE','AB_NEGATIVE','AB_POSITIVE'],
    B_POSITIVE: ['B_POSITIVE','AB_POSITIVE'],
    AB_NEGATIVE: ['AB_NEGATIVE','AB_POSITIVE'],
    AB_POSITIVE: ['AB_POSITIVE']
  };
  return (matrix[donor] || []).includes(recipient);
}

function eligibleByCooldown(date) {
  if (!date) return true;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - COOLDOWN_DAYS);
  return new Date(date) <= cutoff;
}

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = d => d * Math.PI / 180;
  const dLat = toRad(lat2-lat1), dLon = toRad(lon2-lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

async function findMatches(request, Donor, maxDistanceKm) {
  const donors = await Donor.find({ available: true }).lean();
  return donors
    .filter(d => eligibleByCooldown(d.lastDonationDate))
    .filter(d => isCompatible(d.bloodGroup, request.requiredBloodGroup))
    .map(d => {
      const distanceInKm = haversineKm(request.hospitalLatitude, request.hospitalLongitude, d.latitude, d.longitude);
      return {
        donorId: d._id,
        donorName: d.name,
        phoneNumber: d.phoneNumber,
        email: d.email,
        bloodGroup: d.bloodGroup,
        distanceInKm: Number(distanceInKm.toFixed(2)),
        directBloodGroupMatch: d.bloodGroup === request.requiredBloodGroup,
        lastDonationDate: d.lastDonationDate,
        available: d.available
      };
    })
    .filter(m => m.distanceInKm <= maxDistanceKm)
    .sort((a,b) => Number(b.directBloodGroupMatch)-Number(a.directBloodGroupMatch) || a.distanceInKm-b.distanceInKm);
}

module.exports = { isCompatible, eligibleByCooldown, haversineKm, findMatches, COOLDOWN_DAYS };
