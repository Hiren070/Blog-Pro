const BlogModel = require('../models/BlogModel');
const CategoryModel = require('../models/CategoryModel');
const path = require('path');
const fs = require('fs');
const { log } = require('console');

module.exports.addBlog = async (req, res) => {
    try{
        let CategoryData = await CategoryModel.find();
        return res.render('Blog/AddBlog', {
            CategoryData
        });
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.insertBlog = async (req, res) => {
    try{
        var blogImg = '';
        if(req.file){
            blogImg = await BlogModel.imgPath + '/' + req.file.filename;
        }
        req.body.blogImage = blogImg;

       let addBlog = await BlogModel.create(req.body);

        if(addBlog){
            let findCategory = await CategoryModel.findById(req.body.categoryId);
            console.log(findCategory)

            findCategory.Blog_Ids.push(addBlog._id);

            await CategoryModel.findByIdAndUpdate(req.body.categoryId, findCategory)

            console.log("Data inserted successfully..");
            req.flash('success',"Blog Added Successfully")
            return res.redirect('back');
        }
        else{
            console.log("Somethig went wrong..");
            return res.redirect('back');
        }
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.viewBlog = async (req, res) => {
    try{

        let perPage = 3;
        let Page = 0;

        if(req.query.page){
            Page = req.query.page
        }

        // Search
        let Search = '';
        if(req.query.searchBlog){
            Search = req.query.searchBlog;
        }

        let BlogData = await BlogModel.find({
            $or : [
                {blogTitle : {$regex : Search, $options : 'i'}},
                {description : {$regex : Search, $options : 'i'}}
            ]
        }).skip(Page * perPage).limit(perPage).populate('categoryId').exec();

        let totalBlogs = await BlogModel.find({
            $or : [
                {blogTitle : {$regex : Search, $options : 'i'}},
                {description : {$regex : Search, $options : 'i'}}
            ]
        }).countDocuments();

        let TotalCounts = Math.ceil(totalBlogs/perPage);

        return res.render('Blog/ViewBlog', {
            BlogData,
            Search,
            Page,
            TotalCounts
        });
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.deleteBlog = async (req, res) => {
    try{
        let id = req.query.blogId
        let getBlog = await BlogModel.findById(id);
        if(getBlog){
            let oldImagePath = path.join(__dirname, '..', getBlog.blogImage);
            await fs.unlinkSync(oldImagePath);
        }
        
        const deleteBlog = await BlogModel.findByIdAndDelete(id)
        if(deleteBlog){
            console.log("Blog deleted successfully..");
            return res.redirect('back');
        }
        else{
            console.log("Something went wrong..");
            return res.redirect('back');
        }
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.updateBlog = async (req, res) => {
    try{
        let singleObj = await BlogModel.findById(req.params.updateId);
        let CategoryData = await CategoryModel.find();
        res.render('Blog/UpdateBlog', {
            singleObj,
            CategoryData
        })
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.editBlog = async (req, res) => {
    try{
        let blogData = await BlogModel.findById(req.body.blogId);
        if(req.file){
            // Delete Old Image 
            let deleteImg = path.join(__dirname, '..', blogData.blogImage);
            await fs.unlinkSync(deleteImg);
            
            // Insert New Image
            let newImagePath = await BlogModel.imgPath + '/' + req.file.filename;
            req.body.blogImage = newImagePath;
        }
        else{
            req.body.blogImage = blogData.blogImage;
        }

        const updateBlog = await BlogModel.findByIdAndUpdate(req.body.blogId, req.body);

        if(updateBlog){
            console.log("Blog updated successfully");
            return res.redirect('/dashboard/viewBlog')
        }
        else{
            console.log("Something went wrong");    
            return res.redirect('back');
        }
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};


module.exports.deleteMultiBlog = async (req, res) => {
    try{
       let DeleteAllBlog = await BlogModel.deleteMany({_id : {$in : req.body.Ids}});
       if(DeleteAllBlog){
            console.log("Blog deleted successfully");
            return res.redirect('back')
       }
       else{
        console.log("Something went wrong");    
        return res.redirect('back');
       }
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.changeStatus = async (req, res) => {
    try{
       let updateStatus = await BlogModel.findByIdAndUpdate(req.query.blogId, {status : req.query.status})
       return res.redirect('back')
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};
