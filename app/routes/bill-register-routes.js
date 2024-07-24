const express = require("express");
const router = express.Router();
const billRegisterController = require("../controller/accounting-controller/bill-register-controller");

// Create New Bill Code data
router.post("/create-bill-register", (req, res) => {
    billRegisterController
    .createBillRegister(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Get All  Bill Register data
router.get("/get-all-bill-register", (req, res) => {
    billRegisterController
    .findAllBillRegister(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});


// Get All  Bill Register data
router.get("/get-delivery-data/:id", (req, res) => {
    billRegisterController
    .getDeliveryInfoById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/get-all-bill-delivery", (req, res) => {
  billRegisterController
    .getAllBillDeliveryNumber(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update Difference data
router.put("/update-difference-data/:id", (req, res) => {
    billRegisterController
    .updateDifferenceInfoById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update Difference data
router.put("/update-bill-register-data/:id", (req, res) => {
    billRegisterController
    .updateBillRegisterById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete Difference data
router.delete("/delete-bill-register-data/:id", (req, res) => {
    billRegisterController
    .deleteBillRegisterById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;