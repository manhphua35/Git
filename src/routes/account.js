const express = require('express');
const router = express.Router();
const accountController = require('../app/controllers/AccountController');
router.use(express.urlencoded({ extended: true }));
router.post('/updatepassword', accountController.changePassword);
router.get('/change-password',accountController.changePasswordlayout);
router.get('/login',accountController.login)
router.post('/loginto',accountController.loginto);
router.get('/register', accountController.register);
router.post('/stored', accountController.stored);
router.post('/logout', accountController.logout);


module.exports = router;