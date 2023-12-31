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
        const selectedMonth = parseInt(req.query.month);
        const selectedYear = parseInt(req.query.year);
        const page = parseInt(req.query.page) || 1; 
        if(!(req.query.page) || req.query.page < 1) {
            page = 1;
        }
        const limit = parseInt(req.query.limit) || 10; 
        const startIndex = (page - 1) * limit;
        if (!userId) {
            return res.status(401).send('User not authenticated');
        }
    
        try {
            const user = await Account.findOne({ _id: userId });
            if (!user) {
                return res.status(404).send('User not found');
            }
    
            const courses = await Course.find({
                _id: { $in: user.courses },
                createdAt: {
                    $gte: new Date(selectedYear, selectedMonth, 1),
                    $lt: new Date(selectedYear, selectedMonth + 1, 0)
                }
            }).sort({ createdAt: -1 })
              .skip(startIndex)
              .limit(limit);
    
            const totalCourses = await Course.countDocuments({
                _id: { $in: user.courses },
                createdAt: {
                    $gte: new Date(selectedYear, selectedMonth, 1),
                    $lt: new Date(selectedYear, selectedMonth + 1, 0)
                }
            });

            const allCoursesInMonth = await Course.find({
                _id: { $in: user.courses },
                createdAt: {
                    $gte: new Date(selectedYear, selectedMonth, 1),
                    $lt: new Date(selectedYear, selectedMonth + 1, 0)
                }
            });
    
            const groupedCourses = {};
            let monthlyTotal = 0;
            courses.forEach(course => {
                const createdAt = new Date(course.createdAt);
                const dateKey = createdAt.toISOString().split('T')[0];
                if (!groupedCourses[dateKey]) {
                    groupedCourses[dateKey] = [];
                }
                groupedCourses[dateKey].push(course);
            });
        
            allCoursesInMonth.forEach(course => {
                monthlyTotal += course.prices;
            });
            res.json({
                currentPage: page,
                total : totalCourses,
                totalPages: Math.ceil(totalCourses / limit),
                totalAmount: monthlyTotal,
                groupedCourses
            });
    
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }

    async getData(req, res) {
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
                res.json(courses);
                
            } catch (error) {
                console.error('Error:', error);
                res.status(500).send('Internal Server Error');
            }
        }
    }

    async getMonthlyStatistics(req, res) {
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
    
            const currentMonthStartDate = new Date(selectedYear, selectedMonth, 1);
            const currentMonthEndDate = new Date(selectedYear, selectedMonth + 1, 0);
    
            const courses = await Course.find({
                _id: { $in: user.courses },
                createdAt: { $gte: currentMonthStartDate, $lt: currentMonthEndDate }
            });
    
            const summary = courses.reduce((acc, course) => {
                const category = course.action;
                acc[category] = (acc[category] || 0) + course.prices;
                return acc;
            }, {});
    
            let maxExpense = { amount: 0, activity: null, time: null };
            courses.forEach(course => {
                if (course.prices > maxExpense.amount) {
                    maxExpense = { 
                        amount: course.prices, 
                        activity: course.action,
                        time: course.createdAt // Thêm thời gian tạo vào đây
                    };
                }
                
            });
    
            let maxCategory = { category: null, total: 0 };
            for (const [category, total] of Object.entries(summary)) {
                if (total > maxCategory.total) {
                    maxCategory = { category, total };
                }
            }
    
            const currentMonthTotal = courses.reduce((acc, course) => acc + course.prices, 0);
    
            // Calculate for the previous month
            const previousMonthStartDate = selectedMonth === 0 ? new Date(selectedYear - 1, 11, 1) : new Date(selectedYear, selectedMonth - 1, 1);
            const previousMonthEndDate = new Date(selectedYear, selectedMonth, 0);
    
            const previousMonthCourses = await Course.find({
                _id: { $in: user.courses },
                createdAt: { $gte: previousMonthStartDate, $lt: previousMonthEndDate }
            });

            let previousmaxExpense = { amount: 0, activity: null, time: null };

            previousMonthCourses.forEach(course => {
                if (course.prices > previousmaxExpense.amount) {
                    previousmaxExpense = { 
                        amount: course.prices, 
                        activity: course.action,
                        time: course.createdAt 
                    };
                }
                
            });
    
            const previousMonthSummary = previousMonthCourses.reduce((acc, course) => {
                const category = course.action;
                acc[category] = (acc[category] || 0) + course.prices;
                return acc;
            }, {});

            let previousmaxCategory = { category: null, total: 0 };
            for (const [category, total] of Object.entries(previousMonthSummary)) {
                if (total > previousmaxCategory.total) {
                    previousmaxCategory = { category, total };
                }
            }

            
            
    
            const previousMonthTotal = previousMonthCourses.reduce((acc, course) => acc + course.prices, 0);
            const difference = currentMonthTotal - previousMonthTotal;
    
            res.json({
                currentMonth: {
                    month: selectedMonth + 1,
                    year: selectedYear,
                    summary,
                    maxExpense,
                    maxCategory,
                    total: currentMonthTotal
                },
                previousMonth: {
                    month: selectedMonth === 0 ? 12 : selectedMonth,
                    year: selectedMonth === 0 ? selectedYear - 1 : selectedYear,
                    summary: previousMonthSummary,
                    previousmaxExpense,
                    previousmaxCategory,
                    total: previousMonthTotal
                },
                difference
            });
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
    
    
}
    

module.exports = new CourseController();
