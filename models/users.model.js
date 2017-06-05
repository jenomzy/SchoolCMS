var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    username: {
        type: String,
        index: true,
        unique: true,
        required: true
    },
    name: String,
    first_name: String,
    middle_name: String,
    last_name: String,
    sex: String,
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    address: String,
    phone: String,
    account_type: {
        type: String,
        default: "student"
    },
    image: {
      type: String
    },
    fee_statement: [
        {
            description: String,
            debit: String,
            credit: String
        }],
    results: [{
        class: String,
        term: String,
        result_info: [{
            subject: String,
            first_ca: String,
            second_ca: String,
            exam: String
        }]
    }]
});

var User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

module.exports.getUserByUsername = function (username, callback) {
    var query = {username: username};
    User.findOne(query, callback);
};

module.exports.getUserById = function (id, callback) {
    User.findById(id, callback);
};

module.exports.comparePassword = function (candidatePassword, hash, callback) {
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
};

/*
 module.exports.execTransaction = function (card, callback) {
 var query = {card: card};
 User.update(query, callback);
 };*/
