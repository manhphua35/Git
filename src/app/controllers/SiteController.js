const Course = require('../models/Course');
const { multipleMongooseToObject } = require('../../utils/mongoose');
class SiteController {
    async home(req, res, next) {
        try {
            let courses = await Course.find({});  
            res.render('home');
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new SiteController();
