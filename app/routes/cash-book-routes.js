const express = require("express");
const router = express.Router();
const cashBookController = require("../controller/accounting-controller/cashBook-controller");

// Create cash book data
router.post("/create-cash-book", (req, res) => {
  cashBookController
    .createCashBookEntry(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update cash book data
router.put("/update-cash-book/:id", (req, res) => {
  cashBookController
    .updateCashBookEntry(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read cash book data
router.get("/get-cash-book-by-month/:entryMonth/:entryYear", (req, res) => {
  cashBookController
    .getCashBookByMonth(req.params)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete cash book data by id
router.delete("/delete-cash-book/:id", (req, res) => {
  cashBookController
    .deleteCashBookEntry(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
