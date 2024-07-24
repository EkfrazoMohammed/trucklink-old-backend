const express = require("express");
const router = express.Router();
const reportController = require("../controller/reports-controller/reports-controller");

router.get("/report-table-data", (req, res) => {
  reportController
    .getReportTableData(req.query, req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/trip-register-aggregate-values/:id", (req, res) => {
  reportController
    .getTripRegisterAggregates(req.query,req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// http://localhost:4000/api/v1/report-table-data?material=FLYASH&vehicle=Bag&startDate=1592803141105&endDate=1593062341105

// Read ledger data
router.get("/get-ledger-data-owner/:id", (req, res) => {
  reportController
    .getOwnerLedgerData(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read ledger data
router.get("/get-advance-data-test", (req, res) => {
  reportController
    .getOwnerAdvnanceDetailedData(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});


// Read voucher data by id
router.get("/get-owner-voucher/:id", (req, res) => {
  reportController
    .getVoucherDetailsByOwnerId(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
