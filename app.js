require('./config/config');
require('./config/passportConfig');
const jwtHelper=require('./config/jwtHelper');
const express=require("express");
const app=express();
const bodyParser=require("body-parser");
const path=require("path");
const { check, validationResult } = require('express-validator');
const cors = require('cors');
const passport = require('passport');
const confgurationFile=require('./config/passportConfig');
const user=confgurationFile.shareSameUserObject();
const owner=confgurationFile.shareSameOwnerObject();
const multer=require("multer");
const postClass=require("./models/post");
const post=new postClass();
const requestClass=require("./models/request");
const request=new requestClass();



app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(passport.initialize());
app.use(cors());
app.options('*', cors());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.header("Access-Control-Allow-Headers",
     "Origin, X-Requested-With, Content-Type, Accept, x-client-key, x-client-token, x-client-secret,Authorization");
    next();
 });


 ////////////////////////////////////////image//////////////////////////////////////////////////


 const DIR = './public/uploads';

//var TimeNowForImage="";
var ImageValues="";

let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, DIR);
    },
    filename: (req, file, cb) => {
       // TimeNowForImage=Date.now();
       //console.log("file.fieldname ="+file.fieldname );
       //console.log("file.originalname ="+file.originalname);
       ImageValues =file.fieldname +'-'+Date.now()+'-'+file.originalname  ;
   //    console.log("name will pass = " + ImageValues);
        cb(null, ImageValues );
       // path.extname(file.originalname);
    }
});
let upload = multer({storage: storage});

app.post('/api/upload',upload.single('photo'), function (req, res) {
    if (!req.file) {
        console.log("No file received");
        return res.send({
          success: false
        });
    
      } else {
        //console.log('file received');
        return res.send({
          success: true
        })
      }
});


app.post('/addPost',function(req,res){
    
            let data =req.body;
            data.image=ImageValues;

            post.addNewPost(data)
                .then((data) => {
                    ImageValues="";
              res.status(200).json(data);
            }) .catch(err => res.status(400).json(err));

        });


//////////////////////////////////////////////////////////////////////////


app.get('/register',function(req,res){
    res.render("register.ejs",{req:req});
});


app.post('/registerUser', function(req,res){ 
    user.register(req.body)
    .then((data)=>{ 
        res.status(200).json(data);
    })
    .catch((err)=>{console.log(err)
        res.status(200).json(err);
    });
    
});



app.post('/registerOwner', function(req,res){ 
    owner.register(req.body)
    .then((data)=>{ 
         res.status(200).json(data);
    })
    .catch((err)=>{console.log(err)
        res.status(404).json(data);
    });
    
});



app.get('/login',function(req,res){
    res.render("login",{error:""});
});

app.post("/loginUser",function(req,res){
    owner.isOwnerActive=false;
    user.authenticate(req,res);
})
app.post("/loginOwner",function(req,res){
    user.isUserActive=false;
    owner.authenticate(req,res);
})


app.get('/home/:pageNum',function(req,res){
  //  console.log(req.params.pageNum);
    post.getPostsByPaginate(parseInt(req.params.pageNum))
    .then((data)=>{
        res.render("home",{data:data});
    })
    .catch((err)=>{
        res.status(404).json(err);
    })
   
});

/*
app.get('/addPost',function(req,res){
   post.addNewPost(req.body)
   .then((data)=>{
       res.status(200).json(data)
   })
   .catch((err)=>{
       res.status(404).json(err);
   })
});
*/

app.get('/getPosts/:pageNum',function(req,res){
 
    post.getPostsByPaginate(parseInt(req.params.pageNum))
    .then((data)=>{
        res.status(200).json(data)
    })
    .catch((err)=>{
        res.status(404).json(err);
    })
})


app.get('/getPostsCount',function(req,res){

    post.getPostsCount()
    .then((data)=>{
        res.status(200).json(data)
    })
    .catch((err)=>{
        res.status(404).json(err);
    })
})


app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/login');
  });


  
app.get('/addPostIDToOwner/:ownerEmail/:postId',function(req,res){
    owner.pushIntoArrayPosts(req.params.ownerEmail,req.params.postId)
    .then((data)=>{
        res.status(200).json(data)
    })
    .catch((err)=>{
        res.status(404).json(err);
    })
})



app.post('/addRequest',function(req,res){ 
    let data =req.body;
   // console.log(data);
    request.addNewRequest(data)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));

});



app.get('/getAllRequests/:status',function(req,res){ ;
    request.getAllRequests(req.params.status)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));

});


app.get('/getOwnerEmailByPostId/:postId',function(req,res){ 
    owner.getOwnerEmailByPostId(req.params.postId)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});


app.get('/getUserByEmail/:email',function(req,res){ 
    user.getUserByEmail(req.params.email)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});


app.get('/getPostById/:id',function(req,res){ 
    post.getPostById(req.params.id)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});




app.post('/updateRequestStatus/:newStatus',function(req,res){ 
    request.updateRequestStatus(req.body,req.params.newStatus)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});



app.get('/getAllRequestsByUserEmail/:email',function(req,res){ 
    request.getAllRequestsByUserEmail(req.params.email)
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});



app.get('/getAllPosts',function(req,res){ 
    post.getAllPosts()
    .then((data) => {
      res.status(200).json(data);
    }).catch(err => res.status(400).json(err));
});


const port = process.env.PORT || 4000 ;
app.listen(port,function(){
    console.log("app is listening on port "+port);
});