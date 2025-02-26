const CategoryModel = require('../models/CategoryModel');
const BlogModel = require('../models/BlogModel');
const CommentModel = require('../models/CommentModel')

module.exports.home = async (req, res) => {
    try {
        let allBlogs
        let search = ""
        if (req.query.search) {
            search = req.query.search
        }

        const blogCount = await BlogModel.find().countDocuments()
        let page = 0
        let perPage = 3
        if (req.query.page) {
            page += req.query.page
        }

        if (req.query.sort == "asc") {
            if (req.query.catId) {
                console.log(req.query.catId)
                allBlogs = await BlogModel.find({
                    categoryId: req.query.catId,
                    $or: [
                        { blogTitle: { $regex: search } }
                    ]
                }).populate('categoryId').skip(page * perPage).limit(perPage).sort({ _id: 1 })
            }
            else {
                allBlogs = await BlogModel.find({
                    $or: [
                        { blogTitle: { $regex: search } }
                    ]
                }).populate('categoryId').skip(page * perPage).limit(perPage).sort({ _id: 1 })
            }

        } else {

            if (req.query.catId) {
                allBlogs = await BlogModel.find({
                    categoryId: req.query.catId,
                    $or: [
                        { blogTitle: { $regex: search } }
                    ]
                }).populate('categoryId').skip(page * perPage).limit(perPage).sort({ _id: -1 })
            }
            else {
                allBlogs = await BlogModel.find({
                    $or: [
                        { blogTitle: { $regex: search } }
                    ]
                }).populate('categoryId').skip(page * perPage).limit(perPage).sort({ _id: -1 })
            }
        }

        const totalPage = Math.ceil(blogCount / perPage)
        const categories = await CategoryModel.find()
        res.render('UserPanel/Home', {
            allBlogs,
            totalPage,
            page,
            blogCount,
            perPage,
            categories,
            search,
        })
    }
    catch (error) {
        console.log("error =", error);
        return res.redirect('back')
    }
}

module.exports.singleBlog = async (req, res) => {
    try {
        const allComments = await CommentModel.find({ status: true, blogId: req.query.id })
        const singleBlog = await BlogModel.findById(req.query.id).populate('categoryId').populate('commentIds')
        res.render('UserPanel/singleBlog', {
            singleBlog,allComments
        })
    } catch (error) {
        console.log(error)
        res.redirect('back')
    }
}


module.exports.addComment = async (req, res) => {
    try {
        var image = ''
        if (req.file) {
            console.log(req.file)
            image = CommentModel.imgPath + '/' + req.file.filename
        }
        req.body.image = image
        const addCom = await CommentModel.create(req.body)
        if (addCom) {
            const blogCom = await BlogModel.findById(req.body.blogId)
            console.log(addCom._id)
            blogCom.commentIds.push(addCom._id)
            await BlogModel.findByIdAndUpdate(req.body.blogId, blogCom)
            res.redirect('back')
        }

    } catch (error) {
        console.log(error)
        res.redirect('back')
    }
}

module.exports.viewComments = async (req, res) => {
    try {
        let allComments = await CommentModel.find()
        console.log(allComments)
        return res.render('Comment/viewComment', {
            allComments
        })
    } catch (error) {
        console.log(error)
        res.redirect('back')
    }
}