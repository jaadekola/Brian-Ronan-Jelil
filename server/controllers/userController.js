const express = require('express');
const router = new express.Router();
const User = require('../models/user');
const auth = require('../middleware/auth'); //middleware
const multer = require('multer');
const sharp = require('sharp');
const { findOneAndDelete } = require('../models/user');


const createUser = async (req, res)=>{
    //create new user instance 
    const user = new User(req.body);
    try {
        //save user
        await user.save();
        //sendWelcomeEmail(user.email, user.name);
        //send the user back and a token that will be stored in their localstorage
        const token = await user.generateAuthToken();
        res.status(201).send({user, token})
    } catch (e) {
        console.log(e);
        res.status(400).send({error: e.message})
    }
}

const getMyProfile = async (req,res)=>{
    res.send(req.user)
}
const getAllUsers = async (req,res)=>{ 
    try {
        const allUsers = await User.find({})
        res.status(200).send(allUsers)
    } catch (e) {
        res.status(400).send({error: e.message})
    }
}

const deleteUser = async (req, res) => {
    try {
        await User.findOneAndDelete({_id: req.user._id})
        res.send("user deleted")
    } catch (e) {
        res.status(400).send({error: e.message})
    }
}
const updateUser = async(req,res)=>{
    const updates = Object.keys(req.body);
    const allowedUpdates = ['first_name','last_name', 'username', 'email','password'];
    //check the properties to update are allowed
    const isValidOperation = updates.every((update)=>{
        return allowedUpdates.includes(update);
    })

    if(!isValidOperation) {
        return res.status(400).send({error: 'Invalid updates'})
    }
    /*
    const options = {
        new: true, //return the updated user
        runValidators: true
    }
    */
    try {
        //changed findByIdAndUpdate to findById because pre.save(middleware) wont work on former
        const user = req.user;
        //then dynamically update user 
        updates.forEach((update)=>{
            user[update] = req.body[update]
        })
        //now middleware will run
        await user.save();
        res.status(200).send(user);
    } catch (e) {
        console.log("e catch",e);
        //could be 2 types of erros, 1: server, 2: validation
        //2: validation
        res.status(400).send(e);
    }
}

const loginUser = async (req, res)=>{
    try {
        //custom middleware -- static middleware function because we use it on Model - User
        const user = await User.findByCredentials(req.body.email, req.body.password);
        
        //creating a custom middleware -- method middleware function because we use it on instance - user
        //send token
        const token = await user.generateAuthToken();
        
        //save token(s) to db
        user.tokens = user.tokens.concat({token: token});
        await user.save();
        
        // send back user and token to client- if error isnt thrown above this below line will run
        //toJSON is a model method function that runs on model to filter what we send back to user
        res.send({user, token});
    } catch (e) {
        console.log("my error", e.message);
        res.status(400).send({error: e.message});
    }
}

const logout = async (req, res)=>{
    //we have access to user and token
    try {
        /*
        we loop through the tokens array and filter out the token
        on the device user is logging out in, essentially removing that token only
        */
       //create new keys called tokens(new array which is model format) on user obj
        req.user.tokens = req.user.tokens.filter((token)=>{
            return token.token !== req.token;
        })
        await req.user.save();
        //success
        res.send({success: 'logged out'});
    } catch (e) {
        console.log(e);
        res.status(500).send({error: e.message});
    }
}
const logoutAllDevices = async (req, res)=>{
    try {
        //have acccess to tokens, simply empty token array
        req.user.tokens = []
        await req.user.save();
        //success
        res.send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
}

const uploadAvatar = async (req, res)=>{
    const _id = req.user._id;
 
    //using sharp here
    //convert to png (all images will be png) + resize
    const buffer = await sharp(req.file.buffer).resize({width:250, height: 250}).png().toBuffer()
    //because middleware is in place, req may not even get here below
    //all images checking has been done in middleware
    // req.user.avatar = buffer;
    User.findByIdAndUpdate({_id}, { avatar: buffer }, function(e, s){
        //if(e) return res.status(400).send({error: e.message});
        console.log(e, s);
    })
    //await req.user.save()
    res.send("avatar uploaded successfully");
    //redner html src="data:images;base64,[data]"
    //this 4th param handles an error that is throw
}

const displayImage = async(req, res)=>{
    try {
        const user = await User.findById(req.params.id);
        // if(!user || !user.avatar) {
        //     throw new Error();
        // }
        //set a response header
        //its automatically set to application/json
        //here we seding images
        res.set('Content-Type', 'image/png');
        res.send(user.avatar);
    } catch (e) {
        console.log("e",e);
        res.status(404).send({error: e.message});
    }
}

module.exports =  {
    createUser,
    getMyProfile,
    loginUser,
    deleteUser,
    getAllUsers,
    updateUser,
    uploadAvatar,
    displayImage,
    logout,
    logoutAllDevices
}