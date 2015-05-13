var mongoose = require('mongoose')
, Schema = mongoose.Schema;  

var SALT_WORK_FACTOR = 16

var crypto = require('crypto');

var UserSchema = new mongoose.Schema({
  name: {
    unique: true,
    type: String
  },
  password: String,
  salt:String,
  // 0: nomal user
  // 1: verified user
  // 2: professonal user
  // >10: admin
  // >50: super admin
  role: {
    type: Number,
    default: 0
  },
  meta: {
    createAt: {
      type: Date,
      default: Date.now()
    },
    updateAt: {
      type: Date,
      default: Date.now()
    }
  }
})


UserSchema.pre('save', function(next) {
  var user = this

  if (this.isNew) {
    this.meta.createAt = this.meta.updateAt = Date.now()
  }
  else {
    this.meta.updateAt = Date.now()
  }

crypto.randomBytes(SALT_WORK_FACTOR, function (err, salt) {
    if (err) { throw err;}
    salt = new Buffer(salt).toString('hex');
    crypto.pbkdf2(user.password, salt, 7000, 256, function (err,hash) {
        if (err){
          return next(err)
        }
        hash = new Buffer(hash).toString('hex');
        user.password = hash
        user.salt = salt
        next()
    })
  })

})

UserSchema.methods = {
  comparePassword: function(_password,pwd,cb) {
    crypto.pbkdf2(_password, this.salt, 7000, 256, function (err,hash) {
        if (err) return cb(err)
        hash = new Buffer(hash).toString('hex');
        console.log(pwd)
        console.log('------------------')
        console.log(hash)
        if(pwd === hash)
          cb(null, true)
        else
          cb(null, false)
    })
  }
}

UserSchema.statics = {
  fetch: function(cb) {
    return this
      .find({})
      .sort('meta.updateAt')
      .exec(cb)
  },
  findById: function(id, cb) {
    return this
      .findOne({_id: id})
      .exec(cb)
  }
}

var User = mongoose.model('User', UserSchema)
module.exports = User