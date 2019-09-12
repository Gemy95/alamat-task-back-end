const connection= require("../connection");

class Request
{
  constructor()
  {

     var connectionObj=new connection();

     this.requestConnection= connectionObj.con;    

     this.mongooseObj=connectionObj.mongooseObj;

     this.requestSchema=connectionObj.mongooseObj.Schema({
         _id: connectionObj.mongooseObj.Schema.Types.ObjectId,
         userEmail : {type: String,required:" is required"} ,
         postID : {type: String,required:" is required"} ,
         ownerEmail : {type: String,required:" is required"} ,
         status : {type: String,required:" is required"} 
     })

     this.requestModel=this.requestConnection.model("request",this.requestSchema,"request");

  }

  addNewRequest(obj)
  {
     var customObj={};
      customObj._id= this.mongooseObj.Types.ObjectId();
      customObj.userEmail=obj.userEmail;
      customObj.postID=obj.postID;
      customObj.ownerEmail=obj.ownerEmail;
      customObj.status=obj.status;

      return new Promise((resolve,reject)=>{
          this.requestModel.create(customObj,function(err,data){
              if(!err)
              {
                  resolve("request saved successfully");
              }
              else
              {
                  reject("error in save request")
              }
          })
      });
  }


  getAllRequests(status)
  {
      return new Promise((resolve,reject)=>{
          this.requestModel.find({status:status},function(err,data){
              if(!err)
              resolve(data);
              else
              reject(err);
          })
      });
  }


  updateRequestStatus(obj,newStatus)
  {
    return new Promise((resolve,reject)=>{
        
     this.requestModel.findOneAndUpdate({_id:obj._id}, {status:newStatus}, {
            new: true
          }).exec(function(err,data){
            if(!err)
            resolve(data);
            else
            reject(err);
        });
    })
  }


  getAllRequestsByUserEmail(userEmail)
  {
      return new Promise((resolve,reject)=>{
          this.requestModel.find({userEmail:userEmail},function(err,data){
              if(!err)
              resolve(data);
              else
              reject(err);
          })
      });
  }


}

module.exports=Request;

