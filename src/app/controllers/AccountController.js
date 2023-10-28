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
                maxAge: 24 * 60 * 60 * 1000,
                
            });
            
            const userInfo = { id: account._id, username: account.username };
            res.status(200).json({ success: true, message: 'Đăng nhập thành công', accessToken });
            
        } catch (error) {
            console.error(error);
            res.status(500).json('Có lỗi bên server');
        }
    }
        
    async logout(req, res) {
        try {
            
            res.clearCookie('userId');
            res.redirect('/account/login');
        } catch (error) {
            console.error(error);
            res.status(500).json('Có lỗi bên server');
        }
    }
    
}

module.exports = new AccountController();
