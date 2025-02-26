const express = require('express');

const routes = express.Router();

const AdminCtl = require('../controllers/AdminController');

const AdminModel = require('../models/AdminModel');

const passport = require('passport');
const { check } = require('express-validator')

// Dashboard
routes.get('/', AdminCtl.dashboard);

// CRUD
routes.get('/addAdmin', AdminCtl.addAdmin);

routes.post('/insertAdmin', AdminModel.uploadImageFile, [
    check('lname').notEmpty().withMessage('First Name is Required').isLength({ min: 2 }).withMessage('Your Name Must Have an Two Charectors'),
    check('fname').notEmpty().withMessage('Last Name is Required').isLength({ min: 2 }).withMessage('Your Name Must Have an Two Charectors'),
    check('email').notEmpty().withMessage('email is Required').isEmail().withMessage('Enter in  Email Form width (@)  And (.com)').custom(async (value) => {
        let isAdmin = await AdminModel.findOne({email:value})
        if (isAdmin) {
            throw new Error('email Alredy Exist')
        }
    }),
    check('password').notEmpty().withMessage('Password should be greater than 8 characters').isLength({ min: 10 }).withMessage('Your Name Must Have an Ten Charectors').matches(
        /^[A-Za-z]\w{7,14}$/
    ).withMessage('Password Must Be Strong'),
    check('gender').notEmpty().withMessage('Gender is required'),
    check('hobby').notEmpty().withMessage('Atleast one hobby should be selected'),
    check('role').notEmpty().withMessage('role is required'),
    check('message').notEmpty().withMessage('message should not be empty'),
], AdminCtl.insertAdmin);


routes.get('/viewAdmin', AdminCtl.viewAdmin);
routes.get('/deleteAdmin', AdminCtl.deleteAdmin);
routes.get('/updateAdmin/:updateId', AdminCtl.updateAdmin);
routes.post('/editAdmin', AdminModel.uploadImageFile, AdminCtl.editAdmin);

// Show Profile
routes.get('/myProfile', (req, res) => {
    try {
        return res.render('Admin/MyProfile')
    }
    catch (error) {
        console.log("Error = ", error);
        return res.redirect('back');
    }
});

// Change Password
routes.get('/changePassword', AdminCtl.changePassword);

routes.post('/changeNewPassword', AdminCtl.changeNewPassword);

// SignOut
routes.get('/signOut', AdminCtl.signOut);

module.exports = routes;
