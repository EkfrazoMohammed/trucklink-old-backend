const express = require("express");
const router = express.Router();
const masterController = require("../controller/master-data-controller/master-controller");

// Create master data
router.post("/create-material", (req, res) => {
  masterController
    .createMaterial(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Create master data
router.post("/create-load-location", (req, res) => {
  masterController
    .createLoadLocation(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Create master data
router.post("/create-delivery-location", (req, res) => {
  masterController
    .createDeliveryLocation(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read master data  by id
router.get("/get-material", (req, res) => {
  masterController
    .findMaterial()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/get-load-location", (req, res) => {
  masterController
    .findLoadLocation()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/get-delivery-location", (req, res) => {
  masterController
    .findDeliveryLocation()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update MaterialType
router.put("/update-material/:id", (req, res) => {
  masterController 
    .updateMaterialType(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update Load Location
router.put("/update-load-location/:id", (req, res) => {
  masterController 
    .updateLoadLocation(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update Delivery Location
router.put("/update-delivery-location/:id", (req, res) => {
  masterController 
    .updateDeliveryLocation(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
