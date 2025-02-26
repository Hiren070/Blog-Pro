
const mongoose = require('mongoose');
const path = require('path');
const imagePath = '/uploads/UserImage';
const multer = require('multer');

const commentSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    status: {
        type: Boolean,
        default: true,
    },
    image: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "BlogModel"
    }
},
    {
        timestamps: true
    }
);

const commentImageStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '..', imagePath))
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now())
    }
});

commentSchema.statics.uploadImageFile = multer({ storage: commentImageStorage }).single('image');
commentSchema.statics.imgPath = imagePath;

const comment = mongoose.model('comment', commentSchema);

module.exports = comment;