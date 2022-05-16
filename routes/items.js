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

/**
 * Route - Gets all the items from the database and render the page with all the items (index_item.ejs)
 */
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

/**
 * Route - Render the add a new item page (new_item.ejs)
 */
router.get("/new", async(req, res) => {
    renderNewPage(res, new Item());
});

/**
 * Route - Gets a specific item with an id and render a page with all the informations of the item (show_item.ejs)
 */
router.get("/:id", async(req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate("warehouse").exec();
        res.render("items/show_item", { item: item });
    } 
    catch {
        res.redirect("/items");
    }
});

/**
 * Route - Render the edit an item page (edit_item.ejs) with all the information of a specific item. The item is find with his id.
 */
router.get("/:id/edit", async(req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        renderEditPage(res, item);
    } 
    catch {
        res.redirect("/items");
    }
});

/**
 * Route - Adding a new item to the database
 */
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

/**
 * Route - Editing a specifig item find by his id
 */
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

/**
 * Route - Delete an item find by his id
 */
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

/**
 * Render the add a new item page (new_item.ejs)
 * @param {*} res 
 * @param {*} item 
 * @param {*} hasError 
 */
async function renderNewPage(res, item, hasError = false){
    renderFormPage(res, item, 'new_item', hasError = false)
}

/**
 * Render the edit item page (edit_item)
 * @param res 
 * @param item 
 * @param hasError 
 */
async function renderEditPage(res, item, hasError = false){
    renderFormPage(res, item, 'edit_item', hasError = false)
}

/**
 * Render the form page (_form_fields_item.ejs)
 * @param res 
 * @param item 
 * @param form 
 * @param hasError 
 */
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

/**
 * Remove an image of an item that was not correctly added
 * @param fileName 
 */
function removeItemImage(fileName){
    fs.unlink(path.join(uploadPath, fileName), err => {
        if(err) console.log(err);
    })
}

module.exports = router;