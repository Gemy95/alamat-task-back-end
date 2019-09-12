const connection= require("../connection");
const bcrypt = require('bcryptjs');
const passport=require('passport');
const jwt=require('jsonwebtoken');


class User
{
  constructor()
  {
     this.isUserActive=false;

     var connectionObj=new connection();

     this.userConnection= connectionObj.con;    

     this.mongooseObj=connectionObj.mongooseObj;

     this.userSchema=connectionObj.mongooseObj.Schema({
         _id: connectionObj.mongooseObj.Schema.Types.ObjectId,
         userName:{type: String , minLength:3} ,
         email : {type: String,required:" is required",unique:true} ,
         password : {type: String,required:" is required",minLength:5} 
     })

     this.userSchema.path('email').validate(function(val){
       var emailRegEx=/^[a-zA-Z]{3,15}[.]{1}[a-zA-Z0-9]{3,15}[@]{1}[a-z]{4,10}[.]{1}[a-z]{3,5}$/;
        return emailRegEx.test(val);
         },'invalid e-mail');

         this.userSchema.pre('save',function(next){
            let currentUser=this;
            bcrypt.genSalt(10, function(err, salt) {
                bcrypt.hash(currentUser.password, salt, function(err, hash) {
                    currentUser.password=hash;
                    currentUser.saltSecret=salt;
                   next();
                });
            });
           })

     this.userSchema.methods.verifyPassword=function(password)
     {
        return bcrypt.compareSync(password,this.password);
     }

     this.userSchema.methods.generateJwt = function () {
         return jwt.sign({ _id: this._id},
             process.env.JWT_SECRET,
         {
             expiresIn: process.env.JWT_EXP
         });
     }


     this.userModel=this.userConnection.model("user",this.userSchema,"user");

  }


  register(obj)
  {
    
   const instance = new this.userModel(); 
   instance.userName=obj.userName;
   instance.email=obj.email;   
   instance._id=this.mongooseObj.Types.ObjectId();
   instance.password=obj.password;

    return new Promise((resolve,reject)=>{
        
       
        instance.save(function (err) {
            if(!err)
            {
              resolve("user added successfully");
            }
            else
            {
              if(err.code == 11000)
                  reject("error in user email duplication");  
              else

                  reject (err);
            }

            });

        });
    
    
  }

    
    authenticate(req,res,next)
    {
        this.isUserActive=true;

        //console.log("this.isUserActive="+this.isUserActive);

          passport.authenticate('local',(err,user,info)=>{
               if(err)
               {
                  return res.status(400).json(err);
               }
               else if (user)
               {    
                  return res.status(200).json({"token":user.generateJwt()});
                  //return res.redirect('/home/0');
               }
               else
               {  
                  return res.status(404).json(info);  
                  //return res.render('login',{error:info.message});
               }
          })(req,res);
          
    }



    
    userProfile(req,res,next)
    {     
            this.userModel.findOne({ _id: req._id },
                (err, user) => {
                    if (!user)
                        return res.status(404).json({ status: false, message: 'user record not found.' });
                    else
                        return res.status(200).json(user);
                }
            );
        
        
    }


    getUserByEmail(email)
    {
      return new Promise((resolve,reject)=>{
          this.userModel.findOne({email:email},function(err,data){
              if(!err)
              resolve(data);
              else
              reject(err)
          })
      })
    }


}

module.exports=User;

