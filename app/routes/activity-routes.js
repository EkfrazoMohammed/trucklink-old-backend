const express = require("express");
const router = express.Router();
const ActivityLogController = require("../controller/common-controller/activity-log-controller");

// get All Activity logs details 
router.get("/get-all-logs", (req, res) => {
    ActivityLogController
    .getAllLogs()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
