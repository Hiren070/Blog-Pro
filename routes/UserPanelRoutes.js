const express = require('express');

const routes = express.Router();

const userCtl = require('../controllers/UserPanelController');

const comment = require("../models/CommentModel")

routes.get('/', userCtl.home)

routes.get('/singleBlog', userCtl.singleBlog)

routes.post('/addComment',comment.uploadImageFile, userCtl.addComment)

routes.get('/viewComments',userCtl.viewComments)

module.exports = routes;