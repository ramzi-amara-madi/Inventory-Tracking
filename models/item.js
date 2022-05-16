const mongoose = require("mongoose");
const path = require("path");

/**
 * Base path for all the uploaded images
 */
const imageBasePath = "uploads/itemImages";

/**
 * Model that represente an item object
 */
const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    created: {
        type: Date,
        required: true,
        default: Date.now,
    },
    imageName: {
        type: String,
        required: true,
    },
    warehouse: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Warehouse",
    },
});

/**
 * Methode that return the image cover path of the item
 */
itemSchema.virtual("imagePath").get(function() {
    if(this.imageName != null){
        return path.join("/", imageBasePath, this.imageName);
    }
});

module.exports = mongoose.model("Item", itemSchema);
module.exports.imageBasePath = imageBasePath;