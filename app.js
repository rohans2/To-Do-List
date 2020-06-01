//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
mongoose.set("useUnifiedTopology",true);
mongoose.set("useNewUrlParser",true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-rohan:Test123@cluster0-eqy9h.mongodb.net/todolistDB");


const workItems = [];
const itemSchema= {
  name: String
};

const Item=mongoose.model("Item",itemSchema);

const item1=new Item({
  name:"Welcome to your To-Do List"
});

const item2=new Item({
  name:"Hit the + button to add an item"
});

const item3=new Item({
  name:"<--- Hit this to delete an item"
});

const defaultItems=[item1,item2,item3];
const listSchema={
  name:String,
  items:[itemSchema]
}
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

  Item.find({},function(err,foundItems){
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }else{
          console.log("Successfully added default items to the database!!");
        }
      });
      res.redirect("/");
    }
else{
      res.render("list", {listTitle: "Today", newListItems: foundItems});
}
  })
});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName=req.body.list;
  const item= new Item({
    name:itemName
  });

  if(listName==="Today")
  {
  item.save();
  res.redirect("/");
}else{
  List.findOne({name:listName},function(err,foundList){
    foundList.items.push(item);
    foundList.save();
    res.redirect("/"+listName);
  })


}
});

app.post("/delete",function(req,res){
  const checkedItemId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("Deleted Succesfully");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    });
  }

})

app.get("/:anything",function(req,res){
  const customListName=_.capitalize(req.params.anything);

  List.findOne({name:customListName},function(err,list){
   if(!err){
    if(!list){
    //create a new list if not exists

    const newList=new List({
      name:customListName,
      items:defaultItems

    });
      newList.save();
      res.redirect("/"+customListName);
  }else{
      //show an existing list,akready exists
      res.render("list",{listTitle:list.name,newListItems:list.items});
    }
  }
})
})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
