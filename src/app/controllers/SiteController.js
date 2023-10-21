const Course = require('../models/Course');
const { multipleMongooseToObject } = require('../../util/mongoose');
class SiteController {
    async index(req, res, next) {
        try {
            let courses = await Course.find({});  
            res.render('home', {courses : multipleMongooseToObject(courses) });
        } catch (error) {
            next(error);
        }
    }

    search(req, res) {
        res.render('search');
    }
}

module.exports = new SiteController();
