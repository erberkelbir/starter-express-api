//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));


const itemSchema = {
  name :String
};

const listSchema = {
  name : String,
  items : [itemSchema]
}

const List = mongoose.model("List",listSchema);


const Item = mongoose.model("Item",itemSchema);
const item1= new Item({
  name :"Welcome to your to do list!"
});

const item2 = new Item({
  name : "Hit the + button to add a new item"
});

const item3 = new Item({
  name : "<---- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3]

main().catch(err => console.log(err));
async function main() {
  await mongoose.connect('mongodb+srv://erberkelbirr:434erberk@database.kbs0ofd.mongodb.net/todolistDB');
  console.log("Connected succesfully");
}


app.get("/", async function(req, res) {
  await Item.find({}).then((item) => {
    if (item.length === 0){
      Item.insertMany(defaultItems).then(() => {
        
      })
    }
    else{
      res.render("list",{listTitle:"Today",newListItems:item});
    }
    
  })
  

});

app.post("/", async function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newUtem = new Item({
    name : itemName
  });
  if (listName =="Today"){
    await Item.collection.insertOne(newUtem);
    res.redirect("/");
  }
  else{
    await List.findOne({name:listName}).then((value) => {
      value.items.push(newUtem);
      value.save();
      res.redirect("/"+listName)

    });
  }

  
  
  
  
});

app.get("/:customListName",async function(req,res){
  const listName = req.params.customListName;
  await List.findOne({name : listName}).then((found) => {
    if (found == null){
      const list = new List({
        name : listName,
        items: defaultItems
      })
      list.save();
      res.redirect("/"+listName);
    }
    else {
      res.render("list",{listTitle:found.name,newListItems: found.items});
    }
  
  });

  //list.save();


});

app.post("/delete",async function (req,res) {
  const checkboxValue = req.body.checkbox ;
  const listValue = req.body.listName;
  if (listValue ==="Today"){
    await Item.findByIdAndDelete(checkboxValue);
    res.redirect("/");
  }
  else {
    await List.findOneAndDelete({name:listValue},{$pull : {items: {_id : checkboxValue}}}).then(()=>{
      res.redirect("/"+listValue);
    })
    
  
  }
  
  });

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started on port 3000");
});
