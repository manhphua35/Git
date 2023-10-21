const express = require('express');
const router = express.Router();
const accountController = require('../app/controllers/AccountController');
router.use(express.urlencoded({ extended: true }));

router.get('/login',accountController.login)
router.post('/loginto',accountController.loginto);
router.get('/register', accountController.register);
router.post('/stored', accountController.stored);
router.get('/logout', accountController.logout);


module.exports = router;