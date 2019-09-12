const connection= require("../connection");

class Post
{

    constructor()
    {
        this.connnectionObj= new connection();
        this.con=this.connnectionObj.con;
        this.mongoose=this.connnectionObj.mongooseObj;
        this.postSchema=this.mongoose.Schema({
           _id :this.mongoose.Schema.Types.ObjectId,
           image :{type:String},
           address : {type:String},
           floorNumber:{type:Number},
           roomNumber:{type:Number},
           roomLength:{type:Number},
           roomWidth:{type:Number},
           date:{type:Date},
           price:{type:Number}
        });

        this.postModel=this.con.model('post',this.postSchema,'post');
    }

    addNewPost(obj)
    {
        var customObj={};

        customObj._id=this.mongoose.Types.ObjectId();
        customObj.image =obj.image;
        customObj.address =obj.address;
        customObj.floorNumber=obj.floorNumber;
        customObj.roomNumber=obj.roomNumber;
        customObj.roomLength=obj.roomLength;
        customObj.roomWidth=obj.roomWidth;
        customObj.date=obj.date;
        customObj.price=obj.price;

        return new Promise ((resolve,reject)=>{
 
            this.postModel.create(customObj,function(err,data){
                if(!err)
                resolve(customObj._id);
                else
                reject(err);
            });

        })

    }


    getPostsByPaginate(pageNum)
    {
        var perPage=4;

        return new Promise((resolve,reject)=>{
            this.postModel.find({},function(err,data){
                if(!err)
                resolve(data);
                else
                reject(err);
            }).skip(perPage*pageNum).limit(perPage);
        })

    }

    getPostsCount()
    {
        return new Promise((resolve,reject)=>{
            this.postModel.countDocuments({},function(err,data){
                if(!err)
                  resolve(data)
                else
                  reject(err);
            });
        });
    }


    getPostById(id)
    {
        return new Promise((resolve,reject)=>{
            this.postModel.findById(id,function(err,data){
                if(!err)
                  resolve(data)
                else
                  reject(err);
            });
        });

    }


    getAllPosts()
    {
        return new Promise((resolve,reject)=>{
            this.postModel.find({},function(err,data){
                if(!err)
                  resolve(data)
                else
                  reject(err);
            });
        });
    }

   
}

module.exports=Post;