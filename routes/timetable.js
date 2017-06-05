var express = require('express');
var Timetable = require('../models/timetable.model');
var router = express.Router();

router.get('/showtimetable', ensureAuthenticated, function (req, res, next) {
    res.render('timetable', {
        title: "Time Table"
    })
});

router.post('/gettimetable', ensureAuthenticated, function (req, res, next) {
    Timetable.findOne({class: req.body.class}, function (err, result) {
        if (err) console.log(err);
        console.log(result);
        res.render('timetable', {
            timetable: {
                class: result.class,
                subjects: result.subjects
            }
        })
    });

});

router.get('/updatetimetable', ensureAuthenticated, function (req, res, next) {
    res.render('updatetimetable', {
        title: "Change Time Table",
        timetable: {
            class: req.user.class,
            subjects: req.user.subjects
        }
    })
});

router.post('/changetimetable', ensureAuthenticated, function (req, res, next) {
    Timetable.update({class: req.body.class}, {
        $push: {
            subjects: {
                $each: [{
                    "time": req.body.time1,
                    "subject_monday": req.body.mon1,
                    "subject_tuesday": req.body.tue1,
                    "subject_wednesday": req.body.wed1,
                    "subject_thursday": req.body.thur1,
                    "subject_friday": req.body.fri1
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

router.get('/newtimetable', ensureAuthenticated, function (req, res, next) {
    res.render('newtimetable', {
        title: "Time Table"
    })
});

router.post('/newtimetable', ensureAuthenticated, function (req, res, next) {
    var clas = req.body.class;
    var time = req.body.time1;
    var mon = req.body.mon1;
    var tue = req.body.tue1;
    var wed = req.body.wed1;
    var thur = req.body.thur1;
    var fri = req.body.fri1;

    var errors = req.validationErrors();

    if (errors) {
        res.render('newtimetable', {
            errors: errors
        });
    } else {
        var newTimetable = new Timetable({
            class: clas,
            subjects: [{
                time: time,
                subject_monday: mon,
                subject_tuesday: tue,
                subject_wednesday: wed,
                subject_thursday: thur,
                subject_friday: fri
            }]
        });

        Timetable.createTimetable(newTimetable, function (err, timetable) {
            if (err) throw  err;
            console.log(timetable);
        });

        req.flash('success_msg', 'Timetable added');

        res.redirect('/');
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