const Course = require('../models/Course');
const Account = require('../models/Account');
const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
const { multipleMongooseToObject } = require('../../utils/mongoose');
class MeController {
    async  storedCourses(req, res) {
        const userId = req.cookies.userId;
        if (userId==undefined){
            res.redirect('/account/login');
        }else{
            try {
                const user = await Account.findOne({ _id: userId });
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
    }

}
module.exports = new MeController();
