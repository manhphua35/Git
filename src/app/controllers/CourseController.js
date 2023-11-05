const Course = require('../models/Course');
const Account = require('../models/Account');
const { mongooseToObject } = require('../../utils/mongoose');
const {multipleMongooseToObject} =require('../../utils/mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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
            
            const { userId, action, prices, note } = req.body;
            
            const user = await Account.findOne({ _id: userId });
    
            if (!user) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
    
            
            const newCourse = new Course({
                action: action,
                prices: prices,
                note: note
            });
            
            await newCourse.save();
            
            user.courses.push(newCourse._id);
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
            .then(() => res.redirect('/me/stored/courses'))
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
    handleFormAction(req, res, next) {
        switch (req.body.action) {
            case 'delete':
                const accountId = req.cookies.userId;
                if (!accountId) {
                    return res.redirect('/login');
                }
                Account.findOneAndUpdate(
                    { _id: accountId, courses: { $in : req.body.courseIds}}, 
                    { $pull: { courses: { $in : req.body.courseIds} } },
                    { new: true } 
                )
                    .then(updatedAccount => {
                        if (updatedAccount) {
                        
                            return Course.deleteMany({ _id:{ $in : req.body.courseIds} })
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
                break;
            default:
                res.json('error');
        }
    }
    async  getCourses(req, res) {
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
}
    

module.exports = new CourseController();
