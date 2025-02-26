const AdminModel = require('../models/AdminModel');
const path = require('path');
const fs = require('fs')
const CategoryModel = require('../models/CategoryModel')
const BlogModel = require('../models/BlogModel')
const { validationResult } = require('express-validator')
// Dashboard
module.exports.dashboard = async (req, res) => {
    try {
        const allCat = await CategoryModel.find()
        let catArr = []
        let catData = []
        allCat.map((v) => {
            catArr.push(v.categoryName)
            catData.push(v.Blog_Ids.length)
        })
        return res.render('Admin/Dashboard', {
            catArr, catData
        })
    }
    catch (error) {
        console.log("error = ", error);
        return res.redirect('back');
    }
}


// CRUD
module.exports.addAdmin = async (req, res) => {
    try {
        return res.render('Admin/AddAdmin', {
            errorsData: [],
            old: []
        })
    }
    catch (error) {
        console.log("error = ", error);
        return res.redirect('back');
    }
}

module.exports.insertAdmin = async (req, res) => {
    try {
        let errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.render('Admin/AddAdmin', {
                errorsData: errors.mapped(),
                old: req.body
            })
        }
        else {

            var adminImg = ''
            if (req.file) {
                adminImg = AdminModel.imagePath + '/' + req.file.filename;
            }
            req.body.adminImage = adminImg;
            req.body.name = req.body.fname + ' ' + req.body.lname;

            let AdminData = await AdminModel.create(req.body);

            if (AdminData) {
                console.log("Data inserted successfully..");
                return res.redirect('/dashboard/AddAdmin');
            }
            else {
                console.log("Somethig went wrong..");
                return res.redirect('/dashboard/AddAdmin');
            }
        }
    }
    catch (err) {
        console.log("Cannot get data");
        return res.redirect('back');
    }
}

module.exports.viewAdmin = async (req, res) => {
    try {
        let SingleObj = await AdminModel.find();
        if (SingleObj) {
            return res.render('Admin/ViewAdmin', {
                SingleObj
            })
        }
        else {
            return res.redirect('/');
        }
    }
    catch {
        console.log("Data not found..");
        return res.redirect('back')
    }
};

module.exports.deleteAdmin = async (req, res) => {
    try {
        let id = req.query.adminId
        let getAdmin = await AdminModel.findById(id);
        if (getAdmin) {
            let oldImagePath = path.join(__dirname, '..', getAdmin.adminImage);
            await fs.unlinkSync(oldImagePath);
        }

        let deleteAdmin = await AdminModel.findByIdAndDelete(id);
        if (deleteAdmin) {
            console.log("Data deleted successfully..");
            return res.redirect('back');
        }
        else {
            console.log("Something went wrong..");
            return res.redirect('back');
        }
    }
    catch (error) {
        console.log("Error = ", error);
        return res.redirect('back');
    }
};

module.exports.updateAdmin = async (req, res) => {
    try {
        let singleObj = await AdminModel.findById(req.params.updateId);
        let flName = singleObj.name.split(" ");

        return res.render('Admin/EditAdmin', {
            singleObj,
            flName,
        })
    }
    catch (err) {
        console.log("Data not found");
        return res.redirect('back');
    }
};

module.exports.editAdmin = async (req, res) => {
    try {
        let adminData = await AdminModel.findById(req.body.adminId);
        if (req.file) {
            // Delete Old Image 
            let deleteImg = path.join(__dirname, '..', adminData.adminImage);
            await fs.unlinkSync(deleteImg);

            // Insert New Image
            let newImagePath = await AdminModel.imagePath + '/' + req.file.filename;
            req.body.adminImage = newImagePath;
        }
        else {
            req.body.adminImage = adminData.adminImage;
        }

        req.body.name = req.body.fname + ' ' + req.body.lname;
        const updateAdmin = await AdminModel.findByIdAndUpdate(req.body.adminId, req.body);

        if (updateAdmin) {
            console.log("Data updated successfully");

            const newAdminData = await AdminModel.findById(updateAdmin.id);
            if (newAdminData.id == req.user.id) {
                return res.redirect('/dashboard/myProfile')
            } else {
                return res.redirect('/dashboard/viewAdmin');
            }
        } else {
            console.log("Data update failed")
            return res.redirect('back')
        }
    }
    catch (error) {
        console.log("Error = ", error);
        return res.redirect('back');
    }
};

// Change Password
module.exports.changePassword = async (req, res) => {
    try {
        return res.render('Admin/ChangePassword')
    }
    catch (err) {
        console.log("err = ", err);
        return res.redirect('back');
    }
};

module.exports.changeNewPassword = async (req, res) => {
    try {
        let adminOlddata = req.user;
        if (adminOlddata.password == req.body.currentPass) {
            if (req.body.currentPass != req.body.newPass) {
                if (req.body.newPass == req.body.confirmPass) {
                    await AdminModel.findByIdAndUpdate(adminOlddata.id, { password: req.body.newPass });
                    console.log("Password changed successfully");

                    return res.redirect('/dashboard/signOut');
                }
                else {
                    console.log("New Password and Confirm Password is not match! Try Again");
                    return res.redirect('back')
                }
            }
            else {
                console.log("Currend Password and New Password are same! Please Change");
                return res.redirect('back')
            }
        }
        else {
            console.log("Current Password is Wrong! Try Again");
            return res.redirect('back')
        }
    }
    catch (err) {
        console.log("err = ", err);
        return res.redirect('back');
    }
};


// Sign Out
module.exports.signOut = async (req, res) => {
    try {
        req.session.destroy(function (err) {
            if (err) {
                return false;
            }
            return res.redirect('/');
        })
    }
    catch (error) {
        console.log("Error = ", error);
        return res.redirect('back');
    }
}

