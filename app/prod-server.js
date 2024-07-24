const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const logger = require("./common/logger");
const app = express();
const xlsx = require('xlsx')
const fs = require('fs');
const readline = require('readline');
const { google } = require('googleapis');
const key = require('./../service.json')
const cron = require('node-cron');
console.log('prod')
// secure headers
app.use(helmet());
app.use(
  helmet.referrerPolicy({
    policy: "same-origin",
  })
);

const { NODE_ENV, PORT } = process.env;

mongoose.Promise = global.Promise;

// logs of each api's with reponse time

if (NODE_ENV === "production") {
  app.use(
    require("morgan")("combined", {
      stream: logger.stream,
    })
  );
} else {
  app.use(
    require("morgan")("dev", {
      stream: logger.stream,
    })
  );
}
// tell express to use ip of request
app.set("trust proxy", true);

app.use(cors());

app.use(bodyParser.json({ limit: "5mb" }));
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

// cron.schedule('00 28 07 * * *', async () => {
//   console.log('data back up cron, at 7:24AM');
//   // console.log('cron running for every 1 min to clear un-completed tests...');
//   mongoose.connection.db.listCollections().toArray(function (err, names) {
//     promise = new Promise((resolve, reject) => {
//       let temp = []
//       names.map((item, index) => {
//         mongoose.connection.db.collection(item.name, function (err, collection) {
//           collection.find().toArray((err, val) => {
//             temp.push({ [item.name]: val })
//             if (temp.length === names.length) {
//               resolve(temp)
//             }
//           });
//         })
//       })

//     })
//     promise.then((vals) => {
//       exportToExcel(vals, (data) => {
//         pushFile(data)
//       })
//     })
//   });
// })

//defualt route
app.get("/", (req, res) => {
  res.status(200).end("Application Started for TruckLink!!! :)");
});

app.use("/rc-proof", express.static(path.join(__dirname, "/images")));
app.use("/invoice-doc", express.static(path.join(__dirname, "/invoice-images")));

require("./db-connection/db");
require("./db-connection/access")(app);
// require("./db-connection/errorhandler")(app);
require("./db-connection/db");
require("./routes")(app);

const port = PORT || 4000;
app.listen(port, () => logger.info(`Listening on port ${port}`));

module.exports = app;

// const exportToExcel = (data, callback) => {
//   const wb = xlsx.utils.book_new();
//   data.forEach((element) => {
//     for (k in element) {
//       var ws = xlsx.utils.json_to_sheet(element[k]);
//       xlsx.utils.book_append_sheet(wb, ws, k);
//     }
//   });

//   var file = xlsx.writeFile(wb, 'test.xlsx', { type: "file", bookType: 'xlsx' })
//   callback(file)
// }

// const pushFile = (file) => {
//   authorize = (file, callback) => {
//     const scopes = 'https://www.googleapis.com/auth/drive'
//     const jwt = new google.auth.JWT(key.client_email, null, key.private_key, scopes)

//     jwt.authorize().then(() => {
//       callback(file, jwt);
//     }).catch((err) => {
//       console.log(err)
//     })
//   }

//   uploadFile = (file, auth) => {
//     let drive = google.drive({ version: 'v3', auth })
//     var options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
//     var today = new Date();
//     drive.files.create({
//       resource: {
//         'name': `${today.toLocaleDateString("en-US", options)}.xlsx`,
//         parents: ['13Zz4SN-_bksNTOtpS4z52AtmsE5KVltD','1vLZ-QoDhI3TVQkN1yKRyJAR-1pAsgbIA'] //parameter to upload in any Google Drive folder
//       },
//       media: {
//         mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
//         body: fs.createReadStream('./test.xlsx')
//       },
//       fields: 'id'
//     }).then((val) => {
//       console.log('Uploaded to Drive!!!');
//     }).catch((err) => {
//       console.log(err);
//     });
//   }

//   authorize(file, uploadFile);
// }