const express = require("express");
const router = express.Router();
const voucherController = require("../controller/accounting-controller/voucher-controller");

// Create voucher data
router.post("/create-voucher", (req, res) => {
  voucherController
    .createVoucher(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update voucher data
router.put("/update-voucher/:id", (req, res) => {
  voucherController
    .updateVoucher(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read voucher data
router.get("/get-vouchers-by-month/:entryMonth/:entryYear", (req, res) => {
  voucherController
    .getAllVouchersByMonth(req.params)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read voucher data
router.get("/get-voucher-vehicles-info", (req, res) => {
  voucherController
    .getVehicleInfo()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete voucher data by id
router.delete("/delete-voucher/:id", (req, res) => {
  voucherController
    .deleteVoucherById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
