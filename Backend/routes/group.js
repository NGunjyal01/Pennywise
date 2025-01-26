const express = require("express");
const router = express.Router();

const create = require("../controllers/group/create");
const addMembers = require("../controllers/group/addMembers");
const removeMember = require("../controllers/group/removeMember");

router.post("/create",create);
router.patch("/addMembers",addMembers);
router.patch("/removeMember",removeMember);


module.exports = router;