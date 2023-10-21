const Course = require('../models/Course');
const Account = require('../models/Account');
const { mongooseToObject } = require('../../util/mongoose');
const bcrypt = require('bcrypt');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.urlencoded({ extended: true }));

class CourseController {
    async show(req, res, next) {
        const slug = req.params.slug;

        try {
            const course = await Course.findOne({ slug: slug });

            if (!course) {
                console.error('Course not found with slug:', slug);
                return res.status(404).json({ error: 'Course not found' });
            }

            console.log('Course Data:', course);
            res.render('courses/show', { course: mongooseToObject(course) });
        } catch (error) {
            console.error('Database error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    }

    create(req, res, next) {
        res.render('courses/create');
    }

    async store(req, res, next) {
        try {
            //console.log(req.body);
            const { userId, action, prices, note } = req.body;
            // Tìm người dùng bằng userId
            const user = await Account.findOne({ _id: userId });
    
            if (!user) {
                return res.status(404).json({ error: 'Không tìm thấy người dùng' });
            }
    
            // Tạo một đối tượng Course mới từ dữ liệu nhận được
            const newCourse = new Course({
                action: action,
                prices: prices,
                note: note
            });
    
            // Lưu đối tượng Course vào MongoDB
            await newCourse.save();
    
            // Thêm id của Course mới vào mảng courses của người dùng
            user.courses.push(newCourse._id);
            await user.save();
    
            // Trả về phản hồi cho client
            res.json({ message: 'Hoạt động chi tiêu đã được lưu thành công' });
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
                // Xử lý lỗi theo yêu cầu của bạn
                console.error(error);
                res.status(500).json({ message: 'Có lỗi xảy ra khi truy vấn dữ liệu.' });
            });
    }
    
    update(req, res, next) {
        console.log(req.body);
        Course.updateOne({ _id : req.params.id},req.body)
            .then(() => res.redirect('/me/stored/courses'))
           .catch(next);  
    }
}
    

module.exports = new CourseController();
