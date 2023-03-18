const express = require('express');
const bodyParser = require('body-parser')
const date = require(__dirname + '/date.js')
const _ = require("lodash");
const mongoose = require('mongoose');


const app = express();
app.set("view engine", 'ejs')
app.use(bodyParser.urlencoded({extended: true}))
app.use(express.static('public'))

// DB connection
main().catch(err => console.log(err))
async function main(){
    await mongoose.connect('mongodb://mongo:krmuluqshBqyjaWjRYzo@containers-us-west-172.railway.app:6308');
}

const itemsSchema = {
    name: String
}

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema)
const Item = mongoose.model("Item", itemsSchema)

// const item1 = new Item({
//     name: "Welcome to your todo list"
// })

// const item2 = new Item({
//     name: "Click the + button to add"
// })

// async function insert (){
//     try {
//         await Item.insertMany([item1, item2])
//         console.log("successfull")
//     } catch (error) {
//         console.log(error)
//     } 
// }



// insert()

// async function deleteItem(selectedItem){
//     try {
//      await Item.deleteOne({_id:selectedItem}).then(msg=>{
//         console.log(msg)
//      })
        
//     } catch (error) {
//         console.log(error)
//     }
// }
async function createItem(newItem){
    try {
        const item = new Item({
            name: newItem
        })
        item.save()
    } catch (error) {   
        console.log(error)   
    }
}

var items;

app.get("/", function(req, res){

  
 
    async function getAll(){
        try {
        let day = date.getDay()
        items = await Item.find({})
        res.render('list', {listTitle: "Today", newListItems: items})
        } catch (error) {
            console.log(error)
        }
    }
    getAll()

  
    // res.sendFile(__dirname + '/index.html')
  
})

// app.get("/work", function(req, res){
//     items = getAll()
//     url = "/work";
//     res.render('list', {listTitle: "Work List", newListItems: workItems, directory: url})
// })

// app.post("/work", function(req, res){
//     let item = req.body.newItem;
//     workItems.push(item)
//     res.redirect('/work')
// })

app.post('/',function(req,res){
   const newItem = req.body.newItem
   const listName = req.body.list
   if(listName === "Today"){
    createItem(newItem)
    res.redirect("/")
   }else{
   
    async function custom(){
        try {
          await List.findOne({name:listName}).then(list=>{
            const item = new Item({
                name: newItem
            })
            list.items.push(item);
            list.save();
            res.redirect("/"+listName)
          })  
        } catch (error) {
           console.log(error) 
        }
    }

    custom()
   }
})

app.post('/delete',function(req,res){
    const selectedItem = req.body.checkbox
    const listName = req.body.list;
    if(listName === "Today"){
        async function del(){
            try {
                await Item.findByIdAndRemove(selectedItem).then(item=>{
                    console.log(item)
                    res.redirect("/")
                })
            } catch (error) {
                console.log(error)
            }
        }
        del()
        // deleteItem(selectedItem)

    }else{
        try {
            async function deleteCustom(){
                await List.findOneAndUpdate({name:listName},{$pull:{items:{_id:selectedItem}}}).then(item=>{
                     console.log(item)
                     res.redirect("/"+ listName)
                })
                // await List.findOne({name:listName}).then(list=>{
                //     list.items.pop(item => item.name !== selectedItem)
                //     list.save()
                //     res.redirect("/"+ listName)
                // })
            }
            deleteCustom()
        } catch (error) {
            console.log(error)
        }

    }

 })

 app.get("/:customListName", function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  async function find(){
    try {
        await List.findOne({name: customListName}).then(list=>{
            if(list){
                console.log("found")
                res.render("list", {listTitle:list.name, newListItems: list.items})
            }else{
                console.log("not found")
                const list = new List({
                    name:customListName,
                    items: []
                  })
                  list.save()
                  res.redirect("/"+customListName)
            }
        })      
    } catch (error) {
        console.log(error)
    }

  }
  find()



 })

app.listen(process.env.PORT || 3000, function(){
    console.log("Server started on port 3000")
})