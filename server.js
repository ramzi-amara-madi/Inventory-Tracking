if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

// Librairies
const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const methodOverride = require("method-override");

/**
 * All the using routes
 */
const indexRouter = require("./routes/index");
const warehouseRouter = require("./routes/warehouses");
const itemRouter = require("./routes/items");

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.set("layout", "layouts/layout");
app.use(expressLayouts);
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));

/**
 * Setting to connect to the database
 */
const mongoose = require("mongoose");
mongoose.connect(process.env.DATABASE_URL, { 
    useNewUrlParser: true
 });
 const db = mongoose.connection;
 db.on("error", error => console.error(error));
 db.once("open", () => console.log("Connected to Mongoose!"));

 /**
  * Definiton of all the routes
  */
app.use("/", indexRouter);
app.use("/warehouses", warehouseRouter);
app.use("/items", itemRouter);

app.listen(process.env.PORT || 3000);