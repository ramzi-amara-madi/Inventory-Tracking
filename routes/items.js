const express = require("express");
const { param } = require("express/lib/request");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const Item = require("../models/item");
const uploadPath = path.join("public", Item.imageBasePath);
// All the images types that can be uploaded
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

// Get specific item with id
router.get("/:id", async(req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate("warehouse").exec();
        res.render("items/show_item", { item: item });
    } 
    catch {
        res.redirect("/items");
    }
});

// Edit item route
router.get("/:id/edit", async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        renderEditPage(res, item);
    } 
    catch {
        res.redirect("/items");
    }
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
        await item.save();
        res.redirect("items");
    }
    catch {
        if(item.imageName != null){
            removeItemImage(item.imageName);
        }
        renderNewPage(res, item, true);
    }
});

// Edit Item routes
router.put("/:id", upload.single("imageName"), async(req, res) => {
    let item;
    try {
        item = await Item.findById(req.params.id);
        item.name = req.body.name;
        item.quantity = req.body.quantity;
        item.warehouse = req.body.warehouse;
        if(req.file != null && req.file.filename !== ""){
            const fileName = req.file != null ? req.file.filename : null
            item.imageName = fileName;
        }
        await item.save();
        res.redirect("items");
    }
    catch {
        if(item != null){
            renderEditPage(res, item, true);
        }
        else{
            res.redirect("items");
        }
    }
});

// Delete Item routes
router.delete("/:id", async(req, res) => {
    let item;
    try {
        item = await Item.findById(req.params.id);
        await item.remove();
        res.redirect("/items");
    } 
    catch {
        if(item != null){
            res.render("items/show_item", {
                item: item,
                errorMessage : "Could not remove the item",
            });
        }
        else{
            res.redirect("/items");
        }
    }

});

// Methode to render to the add Item page
async function renderNewPage(res, item, hasError = false){
    renderFormPage(res, item, 'new_item', hasError = false)
}

// Methode to render to the edit Item page
async function renderEditPage(res, item, hasError = false){
    renderFormPage(res, item, 'edit_item', hasError = false)
}

// Render the form page
async function renderFormPage(res, item, form, hasError = false){
    try{
        const warehouses = await Warehouse.find({});
        const params = {
            warehouses: warehouses,
            item : item,
        }
        if(hasError){
            if(form === "edit_item"){
                params.errorMessage = "Error editing an Item";
            }
            else if (form === "new_item"){
                params.errorMessage = "Error creating an Item";
            }
        }
        res.render(`items/${form}`, params);
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