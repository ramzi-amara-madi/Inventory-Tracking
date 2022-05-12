const express = require("express");
const router = express.Router();
const Warehouse = require("../models/warehouse");

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

// New Warehouse routes
router.get("/new", (req, res) => {
    res.render("warehouses/new_warehouse", { warehouse: new Warehouse() });
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

module.exports = router;