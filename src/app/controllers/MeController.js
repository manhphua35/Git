const Course = require('../models/Course');
const User = require('../models/Account');
const mongoose = require('mongoose');

const { multipleMongooseToObject } = require('../../util/mongoose');

class MeController {
    
    async storedCourses(req, res) {
        const username = 'phua35';

    try {
        const user = await User.findOne({ username: username });
        const courseIDs = user.courses;

        const courses = await Course.find({
            _id: { $in: courseIDs }
        });

        res.render('me/stored-Courses', {
            courses: multipleMongooseToObject(courses)
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
    }

    async trashCourses(req, res, next) {
        try {
            const deletedCourses = await Course.findDeleted({});
            res.render('me/trash-Courses', { courses: multipleMongooseToObject(deletedCourses) });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}

module.exports = new MeController();
