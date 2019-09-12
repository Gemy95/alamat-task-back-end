const connection= require("../connection");
const bcrypt = require('bcryptjs');
const passport=require('passport');
const jwt=require('jsonwebtoken');


class Owner
{
  constructor()
  {
     this.isOwnerActive=false;

     var connectionObj=new connection();

     this.ownerConnection= connectionObj.con;    

     this.mongooseObj=connectionObj.mongooseObj;

     this.ownerSchema=connectionObj.mongooseObj.Schema({
         _id: connectionObj.mongooseObj.Schema.Types.ObjectId,
         ownerName:{type: String , minLength:3} ,
         email : {type: String,required:" is required",unique:true} ,
         password : {type: String,required:" is required",minLength:5} ,
         arrayPosts:{type:Array}
     })

     this.ownerSchema.path('email').validate(function(val){
       var emailRegEx=/^[a-zA-Z]{3,15}[.]{1}[a-zA-Z0-9]{3,15}[@]{1}[a-z]{4,10}[.]{1}[a-z]{3,5}$/;
        return emailRegEx.test(val);
         },'invalid e-mail');

         this.ownerSchema.pre('save',function(next){
            let currentUser=this;
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(currentUser.password, salt, function(err, hash) {
                    currentUser.password=hash;
                    currentUser.saltSecret=salt;
                   next();
                });
            });
           })

     this.ownerSchema.methods.verifyPassword=function(password)
     {
        return bcrypt.compareSync(password,this.password);
     }

     this.ownerSchema.methods.generateJwt = function () {
         return jwt.sign({ _id: this._id},
             process.env.JWT_SECRET,
         {
             expiresIn: process.env.JWT_EXP
         });
     }


     this.ownerModel=this.ownerConnection.model("owner",this.ownerSchema,"owner");

  }


  register(obj)
  {
   
    const instance = new this.ownerModel(); 
    instance.userName=obj.userName;
    instance.email=obj.email;   
    instance._id=this.mongooseObj.Types.ObjectId();
    instance.password=obj.password;
 
     return new Promise((resolve,reject)=>{
         
        
         instance.save(function (err) {
             if(!err)
             {
               resolve("owner added successfully");
             }
             else
             {
               if(err.code == 11000)
                   reject("error in owner email duplication");  
               else
 
                   reject (err);
             }
 
             });
 
         });
   
  }

    
    authenticate(req,res,next)
    {
        this.isOwnerActive=true;

        //console.log("this.isownerActive="+this.isownerActive);

          passport.authenticate('local',(err,owner,info)=>{
               if(err)
               {
                  return res.status(400).json(err);
               }
               else if (owner)
               {   
                  return res.status(200).json({"token":owner.generateJwt()});
                  //res.redirect('/addPost');
               }
               else
               {
                  return res.status(404).json(info);  
                 //console.log(info);
                 //return res.render('login',{error:info.message});
               }
          })(req,res);
          
    }



    
    ownerProfile(req,res,next)
    {     
            this.ownerModel.findOne({ _id: req._id },
                (err, owner) => {
                    if (!owner)
                        return res.status(404).json({ status: false, message: 'owner record not found.' });
                    else
                        return res.status(200).json(owner);
                }
            );
        
        
    }


    pushIntoArrayPosts(email,postID)
    {
      return new Promise ((resolve,reject)=>{
        this.ownerModel.findOneAndUpdate({email: email}, {$push: {arrayPosts: postID}},function(err,data)
        {
            if(!err)
            resolve(data);
            else
            reject(err);
        });
        })
    }


    getOwnerEmailByPostId(postId)
    {
        return new Promise ((resolve,reject)=>{
   
            this.ownerModel.findOne({arrayPosts: { $in:  postId}}, function(err,data){
             if(!err)
             {
             resolve(data);
             }
             else
             {
             reject(err);
             }
            });         
        });
        
    }


}

module.exports=Owner;

