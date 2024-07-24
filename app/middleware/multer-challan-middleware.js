const multer = require("multer");
const path = require("path");

var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "../images")); 
    },
    filename: function (req, file, cb) {
      var datetimestamp = Date.now();
      cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1])
    }
  });
   
  var upload = multer({ //multer settings 
    storage: storage,
    fileFilter: function (req, file, callback) { //file filter
      if (['xls', 'xlsx'].indexOf(file.originalname.split('.')[file.originalname.split('.').length - 1]) === -1) {
        return callback(new Error('Wrong extension type'));
      }
      callback(null, true);
    }
  }).single('file');



module.exports.upload = upload;
