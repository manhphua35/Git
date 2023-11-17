const express = require('express');
const router = express.Router();
router.use(express.urlencoded({ extended: true }));
const meController = require('../app/controllers/MeController');

router.get('/chart',meController.getChart);
router.get('/stored/courses', meController.storedCourses);

module.exports = router;
