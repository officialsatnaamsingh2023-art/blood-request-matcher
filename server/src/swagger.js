const swaggerDocument = {
  openapi:'3.0.3', info:{title:'BloodConnect API',version:'2.0.0',description:'Emergency blood request, donor and geolocation matching API'},
  servers:[{url:'http://localhost:5000'}],
  paths:{
    '/api/v1/health':{get:{summary:'API health',responses:{200:{description:'OK'}}}},
    '/api/v1/stats':{get:{summary:'Dashboard statistics',responses:{200:{description:'Statistics'}}}},
    '/api/v1/donors':{get:{summary:'List donors',responses:{200:{description:'Donors'}}},post:{summary:'Create donor',requestBody:{required:true,content:{'application/json':{schema:{$ref:'#/components/schemas/Donor'}}}},responses:{201:{description:'Created'}}}},
    '/api/v1/donors/{id}':{put:{summary:'Update donor',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{200:{description:'Updated'}}},delete:{summary:'Delete donor',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{204:{description:'Deleted'}}}},
    '/api/v1/donors/{id}/donation-date':{patch:{summary:'Update last donation date',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}},{in:'query',name:'date',required:true,schema:{type:'string',format:'date'}}],responses:{200:{description:'Updated'}}}},
    '/api/v1/requests':{get:{summary:'List requests',responses:{200:{description:'Requests'}}},post:{summary:'Create request',responses:{201:{description:'Created'}}}},
    '/api/v1/requests/{id}':{get:{summary:'Get request',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{200:{description:'Request'}}},delete:{summary:'Delete request',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}}],responses:{204:{description:'Deleted'}}}},
    '/api/v1/requests/{id}/matches':{get:{summary:'Find compatible donors ranked by distance',parameters:[{in:'path',name:'id',required:true,schema:{type:'string'}},{in:'query',name:'maxDistanceKm',schema:{type:'number',default:50}}],responses:{200:{description:'Matches'}}}},
    '/api/v1/requests/{id}/fulfill':{patch:{summary:'Fulfill request',responses:{200:{description:'Updated'}}}},
    '/api/v1/requests/{id}/cancel':{patch:{summary:'Cancel request',responses:{200:{description:'Updated'}}}}
  },
  components:{schemas:{Donor:{type:'object',required:['name','email','phoneNumber','bloodGroup','latitude','longitude'],properties:{name:{type:'string'},email:{type:'string'},phoneNumber:{type:'string'},bloodGroup:{type:'string'},latitude:{type:'number'},longitude:{type:'number'},lastDonationDate:{type:'string',format:'date',nullable:true},available:{type:'boolean'}}}}}
};
module.exports = swaggerDocument;
