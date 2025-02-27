const express = require("express");
const router = express.Router();

const addTransaction = require("../controllers/transaction/addTransaction");
const removeTransaction = require("../controllers/transaction/removeTransaction");
const editTransaction = require("../controllers/transaction/editTransaction");
const settleUp = require("../controllers/transaction/settleUp");

router.post("/add",addTransaction);
router.post("/edit",editTransaction);
router.delete("/remove",removeTransaction);
router.post("/settleUp",settleUp);

module.exports = router;