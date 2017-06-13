var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TimetableSchema = new Schema({
    class: {
        type: String,
        unique: true
    },
    subjects: [
        {
            time: String,
            subject_monday: String,
            subject_tuesday: String,
            subject_wednesday: String,
            subject_thursday: String,
            subject_friday: String
        }
    ]
});

var Timetable = module.exports = mongoose.model('timetable', TimetableSchema);

module.exports.createTimetable = function (newTimetable, callback) {
        newTimetable.save(callback);
    };