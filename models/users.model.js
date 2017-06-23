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
    role: String,
    image: {
      type: String
    },
    fee_statement: [
        {
            description: String,
            debit: String,
            credit: String
        }],
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

var User = mongoose.model('users', UserSchema);
// var User = module.exports = mongoose.model('users', UserSchema);

module.exports.createUser = function (newUser, callback) {
    bcrypt.genSalt(10, function (err, salt) {
        bcrypt.hash(newUser.password, salt, function (err, hash) {
            newUser.password = hash;
            newUser.save(callback);
        });
    });
};

// UserSchema.pre('save', function(next) {
//     var user = this;
//     var SALT_FACTOR = 5;
//
//     if (!user.isModified('password')) return next();
//
//     bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
//         if (err) return next(err);
//
//         bcrypt.hash(user.password, salt, null, function(err, hash) {
//             if (err) return next(err);
//             user.password = hash;
//             next();
//         });
//     });
// });

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
