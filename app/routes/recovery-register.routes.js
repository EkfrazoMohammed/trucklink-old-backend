const express = require("express");
const router = express.Router();
const recoveryRegisterController = require("../controller/accounting-controller/recovery-register-controller");

// Create New Recovery Code data
router.post("/create-recovery-register", (req, res) => {
    recoveryRegisterController
    .createRecoveryRegister(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});


// get all allrecovery details
router.get("/get-all-recovery-details", (req, res) => {
  recoveryRegisterController
    .findAllRecoveryCodes(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/get-all-recovery-delivery", (req, res) => {
  recoveryRegisterController
    .getAllRecoveryDeliveryNumber(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all Delivery recovery details
router.get("/get-recovery-challan-data/:id", (req, res) => {
  recoveryRegisterController
    .getDeliveryInfoById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all Delivery recovery details
router.put("/update-recovered-value/:recoverId/:challanId", (req, res) => {
  recoveryRegisterController
    .updateRecoverdInfoById (req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// update recovery Code and value 
router.put("/update-recovered-data/:id", (req, res) => {
  
  recoveryRegisterController
    .updateRecoveryRegisterById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete recovery info 
router.delete("/delete-recovered-data/:id", (req, res) => {
  
  recoveryRegisterController
    .deleteRecoveryRegisterById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;