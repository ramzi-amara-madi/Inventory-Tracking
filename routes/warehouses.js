const express = require("express");
const router = express.Router();
const Warehouse = require("../models/warehouse");
const Item = require("../models/item");

/**
 * Route - Render the add a new warehouse page (new_warehouse.ejs)
 */
router.get("/new", (req, res) => {
    //console.log("Mouk");
    res.render("warehouses/new_warehouse", { warehouse: new Warehouse() });
});

/**
 * Route - Gets all the warehouses from the database and render the page with all the warehouses (index_warehouse.ejs)
 */
router.get("/", async(req, res) => {
    let searchOptions = {}
    if(req.query.name != null && req.query.name !== ""){
        searchOptions.name = new RegExp(req.query.name, "i");
    }
    try{
        const warehouses = await Warehouse.find(searchOptions);
        res.render("warehouses/index_warehouse", { 
            warehouses: warehouses,
            searchOptions : req.query,
         });
    }catch{
        res.redirect("/");
    }
    
});

/**
 * Route - Gets a specific warehouse with an id and render a page with all the informations of the warehouse (show_warehouse.ejs)
 */
router.get("/:id", async(req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        const items = await Item.find({ warehouse: warehouse.id }).limit(5).exec();
        res.render("warehouses/show_warehouse", {
            warehouse: warehouse,
            itemRelatedToWarehouse: items,
        });
    } 
    catch {
        res.redirect("/")
    }
});

/**
 * Route - Render the edit an warehouse page (edit_warehouse.ejs) with all the information of a specific warehouse. The warehouse is find with his id.
 */
router.get("/:id/edit", async(req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        res.render("warehouses/edit_warehouse", { warehouse: warehouse });
    } 
    catch {
        res.redirect("/warehouses");
    }
});

/**
 * Route - Adding a new warehouse to the database
 */
router.post("/", async(req, res) => {
    const warehouse = new Warehouse({
        name: req.body.name,
        country: req.body.country,
        state: req.body.state,
        adresse: req.body.adresse,
    });
    try{
        const newWarehouse = await warehouse.save();
        res.redirect("warehouses/");
    }catch{
        res.render("warehouses/new_warehouse", { 
            warehouse: warehouse, 
            errorMessage : "Something went wrong with the adding"
        });
    }
});

/**
 * Route - Editing a specifig warehouse from the database find by his id
 */
router.put("/:id", async(req, res) => {
    let warehouse;
    try{
        warehouse = await Warehouse.findById(req.params.id);
        warehouse.name = req.body.name;
        warehouse.country = req.body.country;
        warehouse.state = req.body.state;
        warehouse.adresse = req.body.adresse;

        await warehouse.save();
        res.redirect("/warehouses");
    }catch{
        if(warehouse == null){
            res.redirect("/warehouses");
        }
        else{
            res.render("warehouses/edit_warehouse", { 
                warehouse: warehouse, 
                errorMessage : "Error while updating the warehouse"
            });
        }
    }
});

/**
 * Route - Delete a warehouse from the database find by his id
 */
router.delete("/:id", async(req, res) => {
    let warehouse;
    try{
        warehouse = await Warehouse.findById(req.params.id);
        
        await warehouse.remove();
        res.redirect("/warehouses");
    }catch{
        res.redirect("/warehouses");
    }
});

module.exports = router;