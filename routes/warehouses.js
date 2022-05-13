const express = require("express");
const router = express.Router();
const Warehouse = require("../models/warehouse");
const Item = require("../models/item");

// New Warehouse routes
router.get("/new", (req, res) => {
    //console.log("Mouk");
    res.render("warehouses/new_warehouse", { warehouse: new Warehouse() });
});

// Warehouses routes
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

// Get the warehouse by his id
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

// Get to the edit page of a Warehouse
router.get("/:id/edit", async(req, res) => {
    try {
        const warehouse = await Warehouse.findById(req.params.id);
        res.render("warehouses/edit_warehouse", { warehouse: warehouse });
    } 
    catch {
        res.redirect("/warehouses");
    }
});

// Create Warehouse routes
router.post("/", async(req, res) => {
    const warehouse = new Warehouse({
        name: req.body.name,
        country: req.body.country,
        state: req.body.state,
        adresse: req.body.adresse,
    });
    try{
        const newWarehouse = await warehouse.save();
        //res.redirect(`warehouses/${newWarehouse.id}`)
        res.redirect("warehouses/");
    }catch{
        res.render("warehouses/new_warehouse", { 
            warehouse: warehouse, 
            errorMessage : `something went wrong` 
        });
    }
});

// Edit router for Warehouse
router.put("/:id", async(req, res) => {
    let warehouse;
    try{
        warehouse = await Warehouse.findById(req.params.id);
        warehouse.name = req.body.name;
        warehouse.country = req.body.country,
        warehouse.state = req.body.state,
        warehouse.adresse = req.body.adresse,
        await warehouse.save();
        //res.redirect(`warehouses/${newWarehouse.id}`)
        res.redirect("/warehouses");
    }catch{
        if(warehouse == null){
            res.redirect("/warehouses");
        }
        else{
            res.render("warehouses/edit_warehouse", { 
                warehouse: warehouse, 
                errorMessage : `Error updating the warehouse` 
            });
        }
    }
});

// Delete router for Warehouse
router.delete("/:id", async(req, res) => {
    let warehouse;
    try{
        warehouse = await Warehouse.findById(req.params.id);
        await warehouse.remove();
        //res.redirect(`warehouses/${newWarehouse.id}`)
        res.redirect("/warehouses");
    }catch{
        res.redirect("/warehouses");
    }
});

module.exports = router;