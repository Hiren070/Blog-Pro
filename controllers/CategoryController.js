const CategoryModel = require('../models/CategoryModel')

module.exports.addCategory = async (req, res) => {
    try{
        return res.render('Category/AddCategory');
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.insertCategory = async (req, res) => {
    try{
        await CategoryModel.create(req.body);
        req.flash('success',"Category Added Successfully")
        return res.redirect('back');
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.viewCategory = async (req, res) => {
    try{
        // Pagination
        let perPage = 3;
        let Page = 0;

        if(req.query.page){
            Page = req.query.page
        }

        //Search 
        let Search = '';
        if(req.query.searchCategory){
            Search = req.query.searchCategory;
        }

        // Sorting
        if(req.query.sortBy == "asc"){
             var CategoryData = await CategoryModel.find({categoryName : {$regex : Search, $options : 'i'}}).skip(Page * perPage).limit(perPage).sort({categoryName : 1});
        }
        else{
            CategoryData = await CategoryModel.find({categoryName : {$regex : Search, $options : 'i'}}).skip(Page * perPage).limit(perPage).sort({categoryName : -1});
        }

        let totalCategory = await CategoryModel.find({categoryName : {$regex : Search, $options : 'i'}}).countDocuments();

        let TotalCounts = Math.ceil(totalCategory/perPage);

        return res.render('Category/ViewCategory', {
            CategoryData,
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

module.exports.deleteCategory = async (req, res) => {
    try{
        await CategoryModel.findByIdAndDelete(req.query.categoryId)
        return res.redirect('back')
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.updateCategory = async (req, res) => {
    try{
        let singleObj = await CategoryModel.findById(req.params.updateId)
        res.render('Category/UpdateCategory', {
            singleObj
        })
    }
    catch(error){
        console.log("error = ", error);    
        return res.redirect('back'); 
    }
};

module.exports.editCategory = async (req, res) => {
    try{
        const updateCategory = await CategoryModel.findByIdAndUpdate(req.body.categoryId, req.body);

        if(updateCategory){
            console.log("Category updated successfully");
            return res.redirect('/dashboard/viewCategory')
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



