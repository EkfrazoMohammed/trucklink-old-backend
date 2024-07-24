const express = require("express");
const router = express.Router();
const OwnerTransferController = require("../controller/onbording-controller/owner-transfer-log-controller");

// get onboarded owner & account details details by id
router.get("/get-all-users-logs", (req, res) => {
    OwnerTransferController
    .getAllLogs()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});







module.exports = router;
