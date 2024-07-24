const express = require("express");
const router = express.Router();
const vehicleController = require("../controller/onbording-controller/vehicle-controller");
const upload = require("../middleware/multer-middleware");

// onboarding vehicle
router.post("/create-vehicle", (req, res) => {
  vehicleController
    .vehicleOnBoardingLogic(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// vehicle rc upload
router.post("/rc-upload", upload.single("file"), function (req, res, next) {
  const fileUrl = `${req.protocol}://${req.headers.host}/rc-proof/${req.file.filename}`;
  if (!req.file) {
    res.status(500);
    return next(err);
  }
  res.json({ rcBookProof: fileUrl });
});

// get all onboarded vehicle details
router.get("/get-vehicle-details", (req, res) => {
  vehicleController
    .getAllVehicles(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all onboarded vehicle details
router.get("/get-vehicle-numbers", (req, res) => {
  vehicleController
    .getAllVehicleNumbers()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all onboarded vehicle details
router.get("/get-old-vehicle-numbers", (req, res) => {
  vehicleController
    .getAllOldVehicleNumbers()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});


// get onboarded vehicle details by id
router.get("/get-vehicle-details/:id", (req, res) => {
  vehicleController
    .findVehicleDetailsById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// edit owner details
router.put("/update-vehicle-details/:id/:ownerId", (req, res) => {
  vehicleController
    .updateVehicleDetailsById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// // Transfer ownership details   vehicleId/Old_Owner_Id
router.put("/update-vehicle-ownership-details/:id/:ownerId", (req, res) => {
  vehicleController
    .updateVehicleOwnershipDetailsById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// delete onboarding vehicle details by id
router.delete("/delete-vehicle-details/:id/:ownerId", (req, res) => {
  vehicleController
    .deleteVehicleDetailsById(req.params)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
