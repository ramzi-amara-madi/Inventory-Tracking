const mongoose = require("mongoose");
const Item = require("./item")

const warehouseSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    adresse: {
        type: String,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
});

warehouseSchema.pre("remove", function(next){
    Item.find({ warehouse: this.id }, (err, items) => {
        if(err){
            next(err)
        }
        else if(items.length > 0){
            next(new Error("This Warehouse has items still"));
        }
        else{
            next();
        }
    });
});

module.exports = mongoose.model("Warehouse", warehouseSchema);