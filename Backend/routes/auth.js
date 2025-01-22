const express = require("express");
const router = express.Router();

const signup = require("../controllers/signup");
const login = require("../controllers/login");
const logout = require("../controllers/logout");

router.post("/signup", signup);
router.post("/login", login);
router.get("/logout", logout);

module.exports = router;