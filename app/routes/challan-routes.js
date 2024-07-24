const express = require("express");
const router = express.Router();
const dispatchController = require("../controller/challan-controller/challan-details-controller");
const { upload } = require('../middleware/multer-challan-middleware');
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");
'use strict';
const excelToJson = require('convert-excel-to-json');

// Create dispatch challan data
router.post("/create-dispatch-challan", (req, res) => {
  dispatchController
    .createDispatchChallan(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// vehicle rc upload
router.post("/dispatch-upload-challan", (req, res) => {

  let exceltojson;

  upload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({ error_code: 1, err_desc: "No file passed" });
      return;
    }
    /** Check the extension of the incoming file and 
     *  use the appropriate module
     */
    // if (req.file.originalname.split('.')[req.file.originalname.split('.').length - 1] === 'xlsx') {
    //   exceltojson = xlsxtojson;
    // } else {
    //   exceltojson = xlstojson;
    // }
    // console.log(req.file.path);
    let result = excelToJson({
      sourceFile: req.file.path,
      columnToKey: {
        A: 'S.No',
        B: '_id',
        C: 'materialType',
        D: 'grNumber',
        E: 'grDate',
        F: 'loadLocation',
        G: 'deliveryLocation',
        H: 'vehicleNumber',
        I: 'vehicleType',
        J: 'deliveryNumber',
        K: 'quantityInMetricTons',
        L: "rate",
        M: "diesel",
        N: "cash",
        O: "bankTransfer"
      }
    });

    //   res.json({ data: result })


    // try {
    //   exceltojson({
    //     input: req.file.path,
    //     output: null, //since we don't need output.json
    //     lowerCaseHeaders: false
    //   }, function (err, result) {
    //     if (err) {
    //       return res.json({ error_code: 1, err_desc: err, data: null });
    //     }

    // console.log(result)
    dispatchController.updateChallanXsl([result])
      .then((data) => {
        res.status(201).send(data);
      }).catch((err) => {
        res.status(400).send(err);
      })



    //   res.json({ data: result });

    // });

    // } catch (e) {
    //   res.json({ error_code: 1, err_desc: "Corupted excel file" });
    // }

  })


});


// Update dispatch challan data status
router.put("/update-dispatch-challan/:id", (req, res) => {
  dispatchController
    .updateDispatchChallanDetailsById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update dispatch challan invoice date
router.put("/update-dispatch-challan-invoice/:id", (req, res) => {
  dispatchController
    .updateDispatchChallanInvoiceById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update dispatch challan data status
router.put("/update-challan-status/:id/:type", (req, res) => {
  dispatchController
    .updateChallanStatus(req.params)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete dispatch challan data by id
router.delete("/delete-dispatch-challan/:id", (req, res) => {
  dispatchController
    .deleteDispatchChallanById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
