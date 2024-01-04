const Account = require('../models/Account');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
class AccountController {
    register(req, res, next) {
        res.render('account/register');
    }
    login(req,res,next) {
        res.render('account/login');

    }
    stored(req, res, next){
        const formData = req.body;
        var name = formData.name;
        var username = formData.username;
        var password = formData.password;
        Account.findOne({ 
            username: username
        })
        .then(formData =>{
            if(formData){
                res.json('Đã có tài khoàn này rồi, vui lòng tạo tài khoản khác');
            }
            else{
                const formData = req.body;
                const account = new Account(formData);
                account.save();
                res.status(200).json({ success: true, message: 'Đăng ký thành công'});
            }
        })}

    async loginto(req, res, next) {
        try {
            const { username, password } = req.body;
        
            const account = await Account.findOne({ username });
        
            if (!account) {
                return res.json('Đăng nhập thất bại: Tài khoản không tồn tại');
            }
        
            if (password !== account.password) {
                return res.json('Đăng nhập thất bại: Sai mật khẩu');
            }
            const accessToken = jwt.sign({ id: account._id, username: account.username }, 'your-secret-key');
            res.cookie('userId', account._id, {
                httpOnly: false,
            });
            
            const userInfo = { name : account.name,id: account._id, username: account.username };
            res.status(200).json({ success: true, message: 'Đăng nhập thành công', accessToken, userInfo });
            
        } catch (error) {
            console.error(error);
            res.status(500).json('Có lỗi bên server');
        }
    }

    async logout(req, res) {
        try {
            res.clearCookie('userId');
            res.status(200).json({ success: true, message: 'Đăng xuất thành công' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi bên server' });
        }
    }

    changePasswordlayout(req, res) {
        res.render('account/change-password');
    }

    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword, confirmNewPassword } = req.body;
            const userId = req.cookies.userId;
            const account = await Account.findById({ _id: userId }); 
         
            if (req.body.currentPassword != account.password) {
                return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác.' });
            }
    
            if (newPassword != confirmNewPassword) {
                return res.status(400).json({ success: false, message: 'Mật khẩu mới và mật khẩu xác nhận không khớp.' });
            }
    
            account.password = newPassword;
            await account.save();
    
            res.status(200).json({ success: true, message: 'Mật khẩu đã được thay đổi thành công.' });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Có lỗi xảy ra khi đổi mật khẩu.' });
        }
    }
    
}

module.exports = new AccountController();
