var mongoose=require("mongoose");

class Connection
{
  constructor()
  {
      this.mongooseObj=mongoose;
     this.con=mongoose.createConnection("mongodb+srv://ali95880:08081995ali@cluster0-1bit0.mongodb.net/alamatDB?retryWrites=true&w=majority", {
     // this.con=mongoose.createConnection("mongodb://localhost:27017/localDB", {
      useCreateIndex:true ,
      useNewUrlParser: true,
      useUnifiedTopology: true})
    
  }


}


module.exports=Connection;