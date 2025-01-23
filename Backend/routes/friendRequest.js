const express = require("express");
const router = express.Router();

const send = require("../controllers/friendRequest/send");
const reject = require("../controllers/friendRequest/reject");

router.post("/send/:to" ,send);
router.delete("/reject/:to",reject);

module.exports = router;