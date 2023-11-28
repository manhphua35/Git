const Course = require('../models/Course');
const Account = require('../models/Account');
const { mongooseToObject } = require('../../utils/mongoose');
const {multipleMongooseToObject} =require('../../utils/mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const moment = require('moment-timezone');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.json());
class CourseController {

    create(req, res, next) {
        const userId = req.cookies.userId;
        if (userId==undefined){
            res.redirect('/account/login');
        }
        else{
            res.render('courses/create');
        }
    }

    async store(req, res, next) {
        try {
            const userId = req.cookies.userId;
            const { action, prices, note, time } = req.body;
    
    
            const user = await Account.findOne({ _id: userId });
            if (!user) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
    
            // Tạo đối tượng mới với dữ liệu từ yêu cầu
            const newExpense = new Course({
                action: action,
                prices: prices,
                note: note,
                createdAt: time ? new Date(time) : new Date(), 
            });
            await newExpense.save();
    
            user.courses.push(newExpense._id);
            await user.save();
    
            res.status(200).json({ success: true, message: 'Lưu hoạt động chi tiêu thành công' });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Có lỗi xảy ra khi lưu hoạt động chi tiêu' });
        }
    }
    
    edit(req, res, next) {
        Course.findById(req.params.id)
        .then(course => res.render('courses/edit',{
            course : mongooseToObject(course)
            }))
            .catch(error => {
                console.error(error);
                res.status(500).json({ message: 'Có lỗi xảy ra khi truy vấn dữ liệu.' });
            });
    }
    
    update(req, res, next) {
        Course.updateOne({ _id : req.params.id},req.body)
            .then(() => res.status(200).json({ success: true}))
           .catch(next);  
    }
    delete(req, res, next) {
        const courseId = req.params.id;
        const accountId = req.cookies.userId;
    
        if (!accountId) {
            return res.redirect('/login');
        }
    
        Account.findOneAndUpdate(
            { _id: accountId, courses: courseId }, 
            { $pull: { courses: courseId } },
            { new: true } 
        )
            .then(updatedAccount => {
                if (updatedAccount) {
                  
                    return Course.deleteOne({ _id: courseId })
                        .then(() => {
                          
                            res.redirect('back');
                        })
                        .catch(error => {
                            
                            next(error);
                        });
                } else {      
                    return res.status(403).send('Unauthorized');
                }
            })
            .catch(error => {
                next(error);
            });
    }

    async getCourses(req, res) {
        const userId = req.cookies.userId;
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10;  

        if (userId == undefined) {
            res.redirect('/account/login');
        } else {
            try {
                const user = await Account.findOne({ _id: userId });
                if (!user) {
                    return res.status(404).send('User not found');
                }

                const courseIDs = user.courses;
                const startIndex = (page - 1) * limit;
                const totalCourses = courseIDs.length;

                const courses = await Course.find({
                    _id: { $in: courseIDs }
                }).sort({ createdAt: -1 }) // Sắp xếp giảm dần theo thời gian tạo
                  .skip(startIndex)
                  .limit(limit);

                res.json({
                    currentPage: page,
                    totalPages: Math.ceil(totalCourses / limit),
                    courses
                });

            } catch (error) {
                console.error('Error:', error);
                res.status(500).send('Internal Server Error');
            }
        }
    }

    async groupedCourses(req, res){
        const userId = req.cookies.userId;
        const selectedMonth = parseInt(req.query.month);
        const selectedYear = parseInt(req.query.year);
    
        if (!userId) {
            return res.status(401).send('User not authenticated');
        }
    
        try {
            const user = await Account.findOne({ _id: userId });
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            const courses = await Course.find({ _id: { $in: user.courses } });
            const groupedCourses = {};
            let monthlyTotal = 0;
    
            courses.forEach(course => {
                const createdAt = new Date(course.createdAt);
                const month = createdAt.getMonth();
                const year = createdAt.getFullYear();
    
                if (month === selectedMonth && year === selectedYear) {
                    monthlyTotal += course.prices;
                    const dateKey = createdAt.toLocaleDateString('en-US');
                    if (!groupedCourses[dateKey]) {
                        groupedCourses[dateKey] = [];
                    }
                    groupedCourses[dateKey].push(course);
                }
            });
    
            res.json({
                totalAmount: monthlyTotal,
                groupedCourses
            });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
}
    

module.exports = new CourseController();
