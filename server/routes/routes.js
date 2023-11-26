const express = require('express')
const router = express.Router()
const User = require('../models/users')
const multer = require('multer')
const fs = require('fs')


//Multer Image Upload
var storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null, './uploads')
    },
    filename: function (req, file, cb){
        cb(null, file.fieldname+"_"+Date.now()+"_"+file.originalname)
    }
})

var upload = multer({
    storage: storage,
}).single("image");


// REST API

//Get all users
router.get('/', async (req, res) => {
    try {
        let users = await User.find({})
        res.render('index', {title: 'Home Page', users})
    } catch(err) {
        res.status(500).send({message: err.message, type: 'danger'})
    }
});

router.get('/add', function (req, res){
    res.render("add_users", {title: "Add Users"});
});

// Add a new user
router.post('/add', upload, async (req, res) => {
    if (req.body.tags && typeof req.body.tags === 'string') {
        req.body.tags = req.body.tags.split(',');
    } else {
        req.body.tags = [];
    }
    try{
        const newUser = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            tags: req.body.tags,
            image: req.file.filename
        });
        let savedUser = await newUser.save();
        req.session.message = {
            type: 'success',
            message: 'User added successfully!'
        };
        res.redirect('/');
    } catch(err){
        res.status(500).send({message: err.message, type: 'danger'})
    }
});

//Edit User Fom Page
router.get('/edit/:id', async (req, res) => {
    let id = req.params.id;
    try{
    let user = await User.findById(id);
        if(user == null){
            res.redirect('/');
        } else {
            res.render('edit_users', {title: 'Edit User', user});
        }
    } catch(err){
        res.redirect('/');
    }
});


//Update User API
router.put('/update/:id', upload, async (req, res) => {
    let id = req.params.id;
    let new_image = ''
    if(req.file){
        new_image = req.file.filename;
        try {
            fs.unlinkSync('./uploads/'+ req.body.old_image)
        } catch(err){
            console.log(err);
        }
    } else{
        new_image = req.body.old_image
    }
    req.body.tags = req.body.tags.split(',');
    try{
        let updateUser = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            tags: req.body.tags,
            image: new_image
        },
        {
            new: true,
            runValidators: true,
            overwrite: true
        })
        req.session.message = {
            type: 'success',
            message: 'User updated successfully!'
        };
        res.redirect('/')
    } catch(err){
        res.json({message: err.message, type: 'danger'});
    }
});

//Delete User
router.delete('/delete/:id', async (req, res) => {
    let id = req.params.id;
    try{
        let deleteUser = await User.findOneAndDelete({_id: id})
        if(deleteUser.image != null){
            fs.unlinkSync('./uploads/'+ deleteUser.image);
        }
        var response = {
            message: "User deleted successfully",
            id: id
        }; 
        req.session.message = {
            type: 'success',
            message: 'User deleted successfully'
        };
        res.send(response);
    } catch(err){
        res.json({message: err.message})
    }
})

module.exports = router