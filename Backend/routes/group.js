const express = require("express");
const router = express.Router();

const create = require("../controllers/group/create");
const addMembers = require("../controllers/group/addMembers");
const removeMember = require("../controllers/group/removeMember");
const getDetails = require("../controllers/group/getDetails");

router.post("/create",create);
router.patch("/addMembers",addMembers);
router.patch("/removeMember",removeMember);
router.get("/getDetails",getDetails);

module.exports = router;