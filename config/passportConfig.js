const passport = require('passport');
const localStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');

var userClass=require("../models/user");
var userObj=new userClass();

var ownerClass=require("../models/owner");
var ownerObj=new ownerClass();


passport.use(
    new localStrategy({ usernameField: 'email' },
        (username, password, done) => {
       //start
      // console.log("start");
      // console.log("userObj.isUserActive="+userObj.isUserActive);
      // console.log("ownerObj.isOwnerActive="+ownerObj.isOwnerActive);
      
       if(userObj.isUserActive==true && ownerObj.isOwnerActive==false)
       {
         //  console.log("user passport");
            userObj.userModel.findOne({ email: username },
                (err, user) => {
                    if (err)
                        return done(err);
                    // unknown user
                    else if (!user)
                        return done(null, false, { message: 'Email user is not registered' });
                    // wrong password
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: 'Wrong password user.' });
                    // authentication succeeded
                    else
                        return done(null, user);
                });
        }
        else if (ownerObj.isOwnerActive==true && userObj.isUserActive==false)
        {
          //  console.log("owner passport");
            ownerObj.ownerModel.findOne({ email: username },
                (err, user) => {
                    if (err)
                        return done(err);
                    // unknown user
                    else if (!user)
                        return done(null, false, { message: 'Email owner is not registered' });
                    // wrong password
                    else if (!user.verifyPassword(password))
                        return done(null, false, { message: 'Wrong password owner.' });
                    // authentication succeeded
                    else
                        return done(null, user);
                });
        }
        else
        {
            console.log("else passport");
        }



                ///end 
        })
);


function shareSameUserObject()
{
    return userObj;
}

function shareSameOwnerObject()
{
    return ownerObj;   
}


module.exports.shareSameUserObject=shareSameUserObject;
module.exports.shareSameOwnerObject=shareSameOwnerObject;
