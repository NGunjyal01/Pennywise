const express = require("express");
const router = express.Router();

const create = require("../controllers/group/create");
const addMembers = require("../controllers/group/addMembers");

router.post("/create",create);
router.post("/addMembers",addMembers);


module.exports = router;