const Course = require('../models/Course');
const { multipleMongooseToObject } = require('../../util/mongoose');
class SiteController {
    async home(req, res, next) {
        try {
            let courses = await Course.find({});  
            res.render('home', {courses : multipleMongooseToObject(courses) });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SiteController();
