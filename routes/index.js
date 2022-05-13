const express = require("express");
const router = express.Router();
const Item = require("../models/item");

router.get("/", async (req, res) => {
    let items
  try {
    items = await Item.find().sort({ created: 'desc' }).limit(10).exec()
  } catch {
    items = []
  }
  res.render('index', { items: items })
});

module.exports = router;