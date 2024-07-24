const express = require("express");
const router = express.Router();
const bankController = require("../controller/onbording-controller/account-controller");

// onboarding owner
router.post("/create-accounts-owner/:ownerId", (req, res) => {
  bankController
    .banksOnBoardingLogic(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all onboarded owner details
router.get("/get-owner-accounts", (req, res) => {
  bankController
    .findAllOwnerAccounts()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get onboarded owner details by id
router.get("/get-owner-accounts/:id", (req, res) => {
  bankController
    .findOwnerAccountById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// edit owner details
router.put("/update-owner-accounts", (req, res) => {
  bankController
    .updateOwnerAccount(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
