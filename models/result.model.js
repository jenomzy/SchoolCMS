var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ResultSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    class: {
        type: String,
        required: true
    },
    term: {
        type: String,
        required: true
    },
    result_info: [{
        subject: {
            type: String,
            unique: true
        },
        first_ca: String,
        second_ca: String,
        exam: String
    }]
});

var Result = module.exports = mongoose.model('result', ResultSchema);

module.exports.createResult = function (newResult, callback) {
    newResult.save(callback);
};