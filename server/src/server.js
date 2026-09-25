require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const mongoose = require('mongoose');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const { Donor, BloodRequest, BLOOD_GROUPS, URGENCY, STATUS } = require('./models');
const { findMatches, COOLDOWN_DAYS } = require('./matching');
const seedDatabase = require('./seed');
const swaggerDocument = require('./swagger');

const app = express();
const PORT = Number(process.env.PORT || 5000);
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5500';
const clientPath = path.join(__dirname, '../../client');

app.use(cors({ origin: CLIENT_URL === '*' ? true : CLIENT_URL }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(express.static(clientPath));

const asyncHandler = fn => (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next);
const bad = (res, code, message) => res.status(code).json({success:false,message});
const validateCoords = (lat, lon) => Number.isFinite(Number(lat)) && Number.isFinite(Number(lon)) && Number(lat)>=-90 && Number(lat)<=90 && Number(lon)>=-180 && Number(lon)<=180;

app.get('/api/v1/health', (req,res) => res.json({success:true,status:'UP',database:mongoose.connection.readyState===1?'connected':'disconnected',timestamp:new Date().toISOString()}));
app.get('/api/v1/meta', (req,res) => res.json({bloodGroups:BLOOD_GROUPS,urgencyLevels:URGENCY,statuses:STATUS,cooldownDays:COOLDOWN_DAYS,defaultMaxDistanceKm:Number(process.env.DEFAULT_MAX_DISTANCE_KM||50)}));
app.get('/api/v1/stats', asyncHandler(async (req,res) => {
  const [donors, availableDonors, openRequests, criticalRequests, fulfilled] = await Promise.all([
    Donor.countDocuments(), Donor.countDocuments({available:true}), BloodRequest.countDocuments({status:'OPEN'}), BloodRequest.countDocuments({status:'OPEN',urgencyLevel:'CRITICAL'}), BloodRequest.countDocuments({status:'FULFILLED'})
  ]);
  res.json({success:true,data:{donors,availableDonors,openRequests,criticalRequests,fulfilled}});
}));

app.get('/api/v1/donors', asyncHandler(async (req,res)=>{
  const filter={};
  if(req.query.bloodGroup) filter.bloodGroup=req.query.bloodGroup;
  if(req.query.available!==undefined) filter.available=req.query.available==='true';
  const donors=await Donor.find(filter).sort({createdAt:-1});
  res.json({success:true,count:donors.length,data:donors});
}));
app.get('/api/v1/donors/:id', asyncHandler(async(req,res)=>{const d=await Donor.findById(req.params.id); if(!d)return bad(res,404,'Donor not found'); res.json({success:true,data:d});}));
app.post('/api/v1/donors', asyncHandler(async(req,res)=>{
  const {name,email,phoneNumber,bloodGroup,latitude,longitude,lastDonationDate=null,available=true}=req.body;
  if(!name||!email||!phoneNumber||!BLOOD_GROUPS.includes(bloodGroup)||!validateCoords(latitude,longitude)) return bad(res,400,'Invalid donor data');
  const d=await Donor.create({name,email,phoneNumber,bloodGroup,latitude:Number(latitude),longitude:Number(longitude),lastDonationDate,available:Boolean(available)});
  res.status(201).json({success:true,message:'Donor registered successfully',data:d});
}));
app.put('/api/v1/donors/:id', asyncHandler(async(req,res)=>{
  const allowed=['name','email','phoneNumber','bloodGroup','latitude','longitude','lastDonationDate','available'];
  const update={}; allowed.forEach(k=>{if(req.body[k]!==undefined) update[k]=req.body[k];});
  if(update.bloodGroup && !BLOOD_GROUPS.includes(update.bloodGroup)) return bad(res,400,'Invalid blood group');
  if(update.latitude!==undefined || update.longitude!==undefined){ if(!validateCoords(update.latitude,update.longitude)) return bad(res,400,'Latitude/longitude are required and must be valid when updating coordinates'); }
  const d=await Donor.findByIdAndUpdate(req.params.id,update,{new:true,runValidators:true}); if(!d)return bad(res,404,'Donor not found'); res.json({success:true,message:'Donor updated',data:d});
}));
app.delete('/api/v1/donors/:id', asyncHandler(async(req,res)=>{const d=await Donor.findByIdAndDelete(req.params.id);if(!d)return bad(res,404,'Donor not found');res.status(204).end();}));
app.patch('/api/v1/donors/:id/donation-date', asyncHandler(async(req,res)=>{const date=req.query.date;if(!date)return bad(res,400,'date query parameter is required');const d=await Donor.findByIdAndUpdate(req.params.id,{lastDonationDate:new Date(date)},{new:true,runValidators:true});if(!d)return bad(res,404,'Donor not found');res.json({success:true,message:'Donation date updated',data:d});}));

app.get('/api/v1/requests', asyncHandler(async(req,res)=>{
  const filter={}; if(req.query.status)filter.status=req.query.status; if(req.query.urgencyLevel)filter.urgencyLevel=req.query.urgencyLevel;
  const requests=await BloodRequest.find(filter).sort({createdAt:-1}); res.json({success:true,count:requests.length,data:requests});
}));
app.get('/api/v1/requests/active', asyncHandler(async(req,res)=>{const data=await BloodRequest.find({status:'OPEN'}).sort({urgencyLevel:1,createdAt:-1});res.json(data);}));
app.get('/api/v1/requests/:id', asyncHandler(async(req,res)=>{const r=await BloodRequest.findById(req.params.id);if(!r)return bad(res,404,'Blood request not found');res.json({success:true,data:r});}));
app.post('/api/v1/requests', asyncHandler(async(req,res)=>{
  const {patientName,hospitalName,requiredBloodGroup,unitsRequired,urgencyLevel,hospitalLatitude,hospitalLongitude}=req.body;
  if(!patientName||!hospitalName||!BLOOD_GROUPS.includes(requiredBloodGroup)||!URGENCY.includes(urgencyLevel)||!Number.isInteger(Number(unitsRequired))||Number(unitsRequired)<1||!validateCoords(hospitalLatitude,hospitalLongitude)) return bad(res,400,'Invalid blood request data');
  const r=await BloodRequest.create({patientName,hospitalName,requiredBloodGroup,unitsRequired:Number(unitsRequired),urgencyLevel,hospitalLatitude:Number(hospitalLatitude),hospitalLongitude:Number(hospitalLongitude),status:'OPEN'});
  res.status(201).json({success:true,message:'Emergency request created',data:r});
}));
app.delete('/api/v1/requests/:id', asyncHandler(async(req,res)=>{const r=await BloodRequest.findByIdAndDelete(req.params.id);if(!r)return bad(res,404,'Blood request not found');res.status(204).end();}));
app.patch('/api/v1/requests/:id/fulfill', asyncHandler(async(req,res)=>{const r=await BloodRequest.findByIdAndUpdate(req.params.id,{status:'FULFILLED'},{new:true});if(!r)return bad(res,404,'Blood request not found');res.json({success:true,message:'Request fulfilled',data:r});}));
app.patch('/api/v1/requests/:id/cancel', asyncHandler(async(req,res)=>{const r=await BloodRequest.findByIdAndUpdate(req.params.id,{status:'CANCELLED'},{new:true});if(!r)return bad(res,404,'Blood request not found');res.json({success:true,message:'Request cancelled',data:r});}));
app.get('/api/v1/requests/:id/matches', asyncHandler(async(req,res)=>{const r=await BloodRequest.findById(req.params.id);if(!r)return bad(res,404,'Blood request not found');const max=Number(req.query.maxDistanceKm || process.env.DEFAULT_MAX_DISTANCE_KM || 50);if(max<0)return bad(res,400,'maxDistanceKm must be non-negative');const matches=await findMatches(r,Donor,max);res.json({success:true,requestId:r._id,maxDistanceKm:max,count:matches.length,data:matches});}));

app.get('*',(req,res)=>res.sendFile(path.join(clientPath,'index.html')));
app.use((err,req,res,next)=>{console.error(err);if(err.code===11000)return bad(res,409,'A donor with this email already exists');res.status(500).json({success:false,message:'Internal server error',error:process.env.NODE_ENV==='production'?undefined:err.message});});

async function start(){
  try { await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/bloodconnect'); await seedDatabase(); app.listen(PORT,()=>console.log(`BloodConnect API running at http://localhost:${PORT}`)); }
  catch(err){ console.error('Startup failed:',err.message); process.exit(1); }
}
if(require.main===module) start();
module.exports={app,start};
