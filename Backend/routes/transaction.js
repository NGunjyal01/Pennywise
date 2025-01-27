const express = require("express");
const router = express.Router();

const addPersonal = require("../controllers/transaction/addPersonal");
const deletePersonal = require("../controllers/transaction/deletePersonal");
const addNonGroup = require("../controllers/transaction/addNonGroup");
const deleteNonGroup = require("../controllers/transaction/deleteNonGroup");
const addExpense = require("../controllers/transaction/addExpense");
const deleteExpense = require("../controllers/transaction/deleteExpense");

// router.post("/addPersonal",addPersonal);
// router.delete("/deletePersonal",deletePersonal);
// router.post("/addNonGroup",addNonGroup);
// router.delete("/deleteNonGroup",deleteNonGroup);
router.post("/addExpense",addExpense);
router.delete("/deleteExpense",deleteExpense);

module.exports = router;