var express = require('express');
var Users = require('../models/users.model');
var router = express.Router();

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

/* GET home page. */
router.get('/', ensureAuthenticated, function (req, res, next) {
    res.render('index', {
        title: 'GIG School CMS',
        user: {
            name: req.user.name,
            firstname: req.user.first_name,
            middlename: req.user.middle_name,
            lastname: req.user.last_name,
            image: req.user.image,
            id: req.user._id,
            email: req.user.email,
            sex: req.user.sex,
            phone: req.user.phone,
            address: req.user.address,
            username: req.user.username,
            history: req.user.history,
            role: req.user.role,
            account_type: req.user.account_type
        }
    });
});

router.get('/showfeestatement', ensureAuthenticated, function (req, res, next) {
    res.render('feestatement',{
        title: "Results",
        user: {
            fee_statement: req.user.fee_statement
        }
    })
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;