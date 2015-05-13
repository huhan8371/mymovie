var mongoose = require('mongoose') 
, Schema = mongoose.Schema;  

var TestSchema = new Schema({  
	openid: String,
	info: String,
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
});  

var Test = mongoose.model("Test",TestSchema);

TestSchema.pre('save', function(next) {
	 if (this.isNew) {
	    this.meta.createAt = this.meta.updateAt = Date.now()
	  }
	  else {
	    this.meta.updateAt = Date.now()
	  }
  });

module.exports = Test;

