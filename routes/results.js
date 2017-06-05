var express = require('express');
var Users = require('../models/users.model');
var router = express.Router();

router.get('/showresults', ensureAuthenticated, function (req, res, next) {
    res.render('results', {
        title: "Results",
        user: {
            username: req.user.username,
            name: req.user.name
        }
    })
});

router.get('/searchallresults', ensureAuthenticated, function (req, res, next) {
    res.render('searchresults', {
        title: "Results"
    })
});

router.get('/inputresults', ensureAuthenticated, function (req, res, next) {
    res.render('inputresult', {
        title: "Results"
    })
});

router.post('/getresult', ensureAuthenticated, function (req, res, next) {
    Users.findOne({username: req.user.username},
        {
            _id:0,
            results: {
                $elemMatch: {
                    class: req.body.class,
                    term: req.body.term
                }
            }
        }, function (err, result) {
            if (err) console.log(err);
            console.log(result);
            console.log(req.user.result_info);
            res.render('results', {
                results: {
                    resultinfo: req.user.result_info
                }
            })
        });
});

router.post('/inputresult', ensureAuthenticated, function (req, res, next) {
    Users.update({username: req.body.student}, {
        $push: {
            results: {
                $each: [{
                    "class": req.body.class,
                    "term": req.body.term,
                    "result_info": [
                        {
                            "subject": req.body.username,
                            "first_ca": req.body.firstca,
                            "second_ca": req.body.secondca,
                            "exam": req.body.exam
                        }
                    ]
                }],
                $position: 0
            }
        }
    }, function (err, result) {
        if (err) throw err;
        else {
            console.log(result);
            res.redirect('/');
        }
    });

});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;