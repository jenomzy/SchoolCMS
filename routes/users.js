var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
var date = new Date();
var today = {date: date.toDateString(), time: date.getTime()};
var request = require("request-json");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;


router.get('/register', ensureAuthenticated, function (req, res, next) {
    res.render('register', {
        title: "User Registration"
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title:"User Login"
    });
});

router.post('/register', ensureAuthenticated, function (req, res, next) {
    var firstname = req.body.first_name;
    var middlename = req.body.middle_name;
    var lastname = req.body.last_name;
    var email = req.body.email;
    var sex = req.body.sex;
    var phone = req.body.phone;
    var address = req.body.address;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;

    //Validation
    req.checkBody('first_name', 'First name is required').notEmpty();
    req.checkBody('middle_name', 'Middle name is required').notEmpty();
    req.checkBody('last_name', 'Last name is required').notEmpty();
    req.checkBody('email', 'Email is required').notEmpty();
    req.checkBody('email', 'Email not valid').isEmail();
    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if(errors)
    {
        res.render('register', {
            errors: errors,
            title: 'User Registration'
        });
    }else
    {
        var newUser = new User({
            name: firstname + middlename + lastname,
            first_name: firstname,
            middle_name: middlename,
            last_name: lastname,
            email: email,
            sex: sex,
            phone: phone,
            address: address,
            username: username,
            password: password
        });

        User.createUser(newUser, function (err, user) {
            if (err) throw  err;
            console.log(user);
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function (username, password, done) {
        User.getUserByUsername(username, function (err, user) {
            if (err) throw  err;
            if(!user)
            {
                return done(null, false, {message: 'Unknown User'});
            }

            User.comparePassword(password, user.password, function (err, isMatch) {
                if(err) throw  err;
                if(!isMatch)
                {
                    return done(null, user);
                }else
                {
                    return done(null, false, {message: 'Invalid Password'});
                }
            });
        });
    }
));

passport.serializeUser(function (user, done) {
    done(null, user.id);
});

passport.deserializeUser(function (id, done) {
    User.getUserById(id, function (err, user) {
        done(err, user)
    });
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
}),
function (req, res, next) {
    res.redirect('/');
});

router.get('/logout', function (req, res) {
    req.logout();

    req.flash('success_msg', 'You are logged out');

    res.redirect('/users/login');
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;