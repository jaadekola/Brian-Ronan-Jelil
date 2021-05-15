const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth'); //middleware
const multer = require('multer');
const sharp = require('sharp');
const { findOneAndDelete } = require('../models/user');
// const { sendWelcomeEmail, sendCancellationEmail } = require('../emails/account');
const { createUser, loginUser, getMyProfile, deleteUser, getAllUsers, updateUser, uploadAvatar, displayImage, logout, logoutAllDevices } = require('../controllers/userController')

//SIGNUP 
router.post('/users', createUser);
//DELETE USER
router.delete('/users/me', auth, deleteUser)
//LOGIN
router.post('/users/login', loginUser);
// Get Profile
router.get('/users/me', auth, getMyProfile);
// Get all Barbers
router.get('/users/all', auth, getAllUsers);

router.patch('/users/me', auth, updateUser);
//LOGOUT
router.post('/users/logout', auth, logout)
//LOGOUT ALL
router.post('/users/logoutAll', auth, logoutAllDevices)

//AVATAR
const upload = multer({
    //by removing dest, the data is passed into the function (route below: req.file)
    // dest: 'avatars',
    limits: {
        //1mb = one million
        fileSize: 1000000,  
    },
    // filter certain files
    fileFilter(req, file, cb) {
        //to throw error cb(new Error('file must be pdf'))
        //success = cb(undefined, true)
        if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
            return cb(new Error('images only'))
        }
        cb(undefined, true)
    }
})

//'upload' needs to match key in postman
router.post('/users/me/avatars', auth, upload.single('avatar'), uploadAvatar, (error, req, res, next)=>{
    console.log(error);
    //will receive an error thrown in a middleware function
    res.status(400).send({error: error.message})
})

router.delete('/users/me/avatars', auth, async(req, res)=>{
    req.user.avatar = undefined; 
    const user = await req.user.save();
    res.send(user);
}, (error, req, res, next)=>{
    //will receive an error thrown in a middleware function
    res.status(400).send({error: error.message})
})

//url to paste in browser http://localhost:3000/users/5f1ea7b14888f3644abe20e5/avatar
router.get('/users/:id/avatar', displayImage)
// Add work photos config
const uploadMany = multer({
    //by removing dest, the data is passed into the function (route below: req.file)
    // dest: 'avatars',
    limits: {
        //1mb = one million
        fileSize: 1000000,  
    },
    // filter certain files
    fileFilter(req, files, cb) {
        console.log("files", files);
        //to throw error cb(new Error('file must be pdf'))
        //success = cb(undefined, true)
        // if (!file.originalname.match(/\.(jpeg|jpg|png)$/)) {
        //     return cb(new Error('images only'))
        // }
        cb(undefined, true)
    }
})

// User.deleteMany({}, function (e, s) {
//         console.log(e,s);
// })

module.exports = router;