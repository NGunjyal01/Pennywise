const express = require("express");
const router = express.Router();

const addPersonal = require("../controllers/transaction/addPersonal");
const deletePersonal = require("../controllers/transaction/deletePersonal");

router.post("/addPersonal",addPersonal);
router.delete("/deletePersonal",deletePersonal);

module.exports = router;