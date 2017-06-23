var express = require('express');
var router = express.Router();
var User = require('../models/users.model');
var date = new Date();
var today = {date: date.toDateString(), time: date.getTime()};
var request = require("request-json");
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var nodemailer = require('nodemailer');
var async = require('async');
var crypto = require('crypto');

require('hbs').registerHelper('compare', function (lvalue, rvalue, options) {
    if(arguments.length < 3)
        throw new Error("");
    if(lvalue!=rvalue){
        return options.inverse(this);
    }
    else {
        return options.fn(this);
    }
});

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

router.get('/searchstudent', function (req, res, next) {
    res.render('searchstudents', {
        title: "Search Students"
    })
});

router.get('/searchstaff', function (req, res, next) {
    res.render('searchstaff', {
        title: "Search Staffs"
    })
});

router.get('/forgotpassword', function (req, res, next) {
    res.render('forgotpassword', {
        title: "Forgot Password"
    })
});

router.post('/forgot', function (req, res, next) {
    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        },
        function(token, done) {
            User.findOne({ email: req.body.email }, function(err, user) {
                if (!user) {
                    req.flash('error', 'No account with that email address exists.');
                    return res.redirect('/forgot');
                }

                user.resetPasswordToken = token;
                user.resetPasswordExpires = Date.now() + 3600000; // 1 hour

                user.save(function(err) {
                    done(err, token, user);
                });
            });
        },
        function(token, user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Outlook365',
                auth: {
                    user: '!!! YOUR SENDGRID USERNAME !!!',
                    pass: '!!! YOUR SENDGRID PASSWORD !!!'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'CMS Password Reset',
                text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                'http://' + req.headers.host + '/reset/' + token + '\n\n' +
                'If you did not request this, please ignore this email and your password will remain unchanged.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('info', 'An e-mail has been sent to ' + user.email + ' with further instructions.');
                done(err, 'done');
            });
        }
    ], function(err) {
        if (err) return next(err);
        res.redirect('/forgot');
    });
});

router.get('/reset/:token', function(req, res) {
    User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
        if (!user) {
            req.flash('error', 'Password reset token is invalid or has expired.');
            return res.redirect('/forgot');
        }
        res.render('reset', {
            user: req.user
        });
    });
});

router.post('/reset/:token', function (req, res, next) {
    async.waterfall([
        function(done) {
            User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(err, user) {
                if (!user) {
                    req.flash('error', 'Password reset token is invalid or has expired.');
                    return res.redirect('back');
                }

                user.password = req.body.password;
                user.resetPasswordToken = undefined;
                user.resetPasswordExpires = undefined;

                user.save(function(err) {
                    req.logIn(user, function(err) {
                        done(err, user);
                    });
                });
            });
        },
        function(user, done) {
            var smtpTransport = nodemailer.createTransport('SMTP', {
                service: 'Outlook365',
                auth: {
                    user: '!!! YOUR SENDGRID USERNAME !!!',
                    pass: '!!! YOUR SENDGRID PASSWORD !!!'
                }
            });
            var mailOptions = {
                to: user.email,
                from: 'passwordreset@demo.com',
                subject: 'Your password has been changed',
                text: 'Hello,\n\n' +
                'This is a confirmation that the password for your account ' + user.email + ' has just been changed.\n'
            };
            smtpTransport.sendMail(mailOptions, function(err) {
                req.flash('success', 'Success! Your password has been changed.');
                done(err);
            });
        }
    ], function(err) {
        res.redirect('/');
    });
});

router.post('/updatestudentinfo', function (req, res, next) {
    User.update({username: req.body.username}, {
        $push: {
            $each: [{
                "name": req.body.fullname,
                "first_name": req.body.firstname,
                "middle_name": req.body.middlename,
                "last_name": req.body.lastname,
                "sex": req.body.sex,
                "email": req.body.email,
                "address": req.body.address,
                "phone": req.body.phone
            }],
            $position: 0
        }
    }, function (err, result) {
        if (err) throw err;
        else {
            console.log(result);
            res.redirect('/searchstudent');
        }
    });
});

router.post('/updatestaffinfo', function (req, res, next) {
    User.update({username: req.body.username}, {
        $push: {
            $each: [{
                "name": req.body.fullname,
                "first_name": req.body.firstname,
                "middle_name": req.body.middlename,
                "last_name": req.body.lastname,
                "sex": req.body.sex,
                "email": req.body.email,
                "address": req.body.address,
                "phone": req.body.phone
            }],
            $position: 0
        }
    }, function (err, result) {
        if (err) throw err;
        else {
            console.log(result);
            res.redirect('/searchstudent');
        }
    });
});

router.get('/fees', function (req, res, next) {
    res.render('inputfees', {
        title: "Input Fees"
    })
});

router.post('/savefees', function (req, res, next) {
    var description = req.body.desc;
    var debit = req.body.deb;
    var credit = req.body.cre;

    var newUser = new User({
        fee_statement: [
            {
                description: description,
                debit: debit,
                credit: credit
            }
        ]
    });

    User.createUser(newUser, function (err, user) {
        if (err) throw  err;
        console.log(user);
    });

    req.flash('success_msg', 'Fees statement has been added.');

    res.redirect('/users/fees');
});

router.get('/feestatement', function (req, res, next) {
    res.render('feestatement', {
        title: "Fees Statement"
    })
});

router.post('/register', ensureAuthenticated, function (req, res, next) {
    var firstname = req.body.first_name;
    var middlename = req.body.middle_name;
    var lastname = req.body.last_name;
    var email = req.body.email;
    var sex = req.body.sex;
    var role = req.body.role;
    var phone = req.body.phone;
    var address = req.body.address;
    var username = req.body.username;
    var password = req.body.password + a;
    var password2 = req.body.password2 + a;

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
            role: role,
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

        res.redirect('/users/register');
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