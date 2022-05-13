const express = require("express");
const { param } = require("express/lib/request");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Item = require("../models/item");
const uploadPath = path.join("public", Item.imageBasePath);
const imageMimeTypes = ['image/jpeg', 'image/png', 'images/gif']
const Warehouse = require("../models/warehouse");
const upload = multer({
    dest: uploadPath,
    fileFilter: (req, file, callback) => {
        callback(null, imageMimeTypes.includes(file.mimetype))
    }
});

// Items routes
router.get("/", async(req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try{
        const items = await Item.find(searchOptions);
        res.render("items/index_item", { 
            items: items,
            searchOptions : req.query,
         });
    }catch{
        res.redirect("/");
    }
});

// New Item routes
router.get("/new", async(req, res) => {
    renderNewPage(res, new Item());
});

// Create Item routes
router.post("/", upload.single("imageName"), async(req, res) => {
    const fileName = req.file != null ? req.file.filename : null
    const item = new Item({
        name: req.body.name,
        quantity: req.body.quantity,
        warehouse: req.body.warehouse,
        imageName: fileName,
    });
    try {
        const newItem = await item.save();
        //res.redirect(`items/${newItem.id}`)
        res.redirect("items");
    }
    catch {
        if(item.imageName != null){
            removeItemImage(item.imageName);
        }
        renderNewPage(res, item, true);
    }
});

// Methode to render to the add Item page
async function renderNewPage(res, item, hasError = false){
    try{
        const warehouses = await Warehouse.find({});
        const params = {
            warehouses: warehouses,
            item : item,
        }
        if(hasError) params.errorMessage = "Error creating an Item";
        res.render("items/new_item", params);
    }catch{
        res.redirect("/items");
    }
}

// To remove an image of an item that was not correctly added
function removeItemImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.log(err);
    })
}

module.exports = router;