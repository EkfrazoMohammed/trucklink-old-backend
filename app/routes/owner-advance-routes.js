const express = require("express");
const router = express.Router();
const ownerAdvanceController = require("../controller/accounting-controller/owner-advance-controller");

// Create New ledger data
router.post("/create-owner-advance", (req, res) => {
  ownerAdvanceController
    .createOwnerAdvance(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Add & Update ledger data
router.put("/create-owner-ledger-entry/:id", (req, res) => {
  ownerAdvanceController
    .createOwnerLedgerEntry(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update ledger data
router.put("/update-owner-ledger-entry/:ownerId/:ledgerId", (req, res) => {
  ownerAdvanceController
    .updateIndividualLedgerEntry(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read ledger data
router.get("/get-owner-advance-data", (req, res) => {
  ownerAdvanceController
    .getOwnerAdvanceData(req.params)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read owner data
router.get("/get-advance-data", (req, res) => {
  ownerAdvanceController
    .fetchOwnerAdvanceData()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read ledger data
router.get("/get-ledger-data/:id", (req, res) => {
  ownerAdvanceController
    .fetchOwnerLedgerData(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read cash book data
router.get("/get-owner-advance-outstanding-details", (req, res) => {
  ownerAdvanceController
    .getOwnersOutStandingAmount(null)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read cash book data
router.get("/get-owner-advance-outstanding-details/:id", (req, res) => {
  ownerAdvanceController
    .getOwnersOutStandingAmount(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.delete("/delete-owner-ledger/:ledgerId", (req, res) => {
  ownerAdvanceController
    .deleteOwnerLedger(req.params.ledgerId)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.delete("/delete-owner-record/:id", (req, res) => {
  ownerAdvanceController
    .deleteOwner(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
