const express = require('express');
const router = express.Router();
const courseController = require('../app/controllers/CourseController');
router.use(express.urlencoded({ extended: true }));



router.get('/:id/edit',courseController.edit);
router.put('/:id',courseController.update);
router.get('/create', courseController.create);
router.post('/store',courseController.store);

//router.get('/', courseController.index);

module.exports = router;
