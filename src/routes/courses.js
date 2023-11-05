const express = require('express');
const router = express.Router();
const courseController = require('../app/controllers/CourseController');
router.use(express.urlencoded({ extended: true }));

router.get('/get-courses',courseController.getCourses);
router.post('/handle-form-actions',courseController.handleFormAction);
router.get('/:id/edit',courseController.edit);
router.put('/:id',courseController.update);
router.delete('/:id',courseController.delete);
router.get('/create', courseController.create);
router.post('/store',courseController.store);


module.exports = router;
