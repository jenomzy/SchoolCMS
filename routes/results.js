var express = require('express');
var Result = require('../models/result.model');
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

router.get('/marks', ensureAuthenticated, function (req, res, next) {
    res.render('changemarks', {
        title: "Change Results"
    })
});

router.post('/correctmarks', function (req, res, next) {
    Result.update({username: req.body.student}, {
        $push: {
            $each: [{
                "class": req.body.class,
                "term": req.body.term,
                "result_info": [
                    {
                        "subject": req.body.subject,
                        "first_ca": req.body.firstca,
                        "second_ca": req.body.secondca,
                        "exam": req.body.exam
                    }
                ]
            }],
            $position: 0
        }
    }, function (err, result) {
        if (err) throw err;
        else {
            console.log(result);
            res.redirect('/');
        }
    });
});

router.post('/getresult', ensureAuthenticated, function (req, res, next) {
    Result.findOne({username: req.user.username},{class: req.body.class},{term: req.body.term}
        , function (err, result) {
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

router.post('/searchresult', ensureAuthenticated, function (req, res, next) {
    Result.findOne({username: req.body.username},{class: req.body.class},{term: req.body.term}
        , function (err, result) {
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
    var student = req.body.student;
    var clas = req.body.class;
    var term = req.body.term;
    var subj = req.body.subject;
    var fca = req.body.firstca;
    var sca = req.body.secondca;
    var exa = req.body.exam;

    var errors = req.validationErrors();

    if (errors) {
        res.render('inputresult', {
            errors: errors
        });
    } else {
        var newResult = new Result({
            username: student,
            class: clas,
            term: term,
            result_info: [{
                subject: subj,
                first_ca: fca,
                second_ca: sca,
                exam: exa
            }]
        });

        Result.createResult(newResult, function (err, result) {
            if (err) throw  err;
            console.log(result);
        });

        req.flash('success_msg', 'Result added');

        res.redirect('/inputresults');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;