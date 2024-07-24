const express = require("express");
const router = express.Router();
const ownerController = require("../controller/onbording-controller/owner-controller");
const states = require("../configure/state-list.js");
const { upload } = require('../middleware/multer-challan-middleware');
'use strict';
const excelToJson = require('convert-excel-to-json');

// onboarding owner
router.post("/create-owner", (req, res) => {
  ownerController
    .createVehicleOwner(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// onboarding owner
router.post("/create-owner-by-xsl", (req, res) => {


  upload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({ error_code: 1, err_desc: "No file passed" });
      return;
    }

    let result = excelToJson({
      sourceFile: req.file.path,
      columnToKey: {
        A: 'S.No',
        B: 'name',
        C: 'address',
        D: 'district',
        E: 'state',
        F: 'panNumber',
        G: 'phoneNumber',
        H: 'email',
        I: 'accountNumber',
        J: 'accountHolderName',
        K: 'ifscCode',
        L: 'bankName',
        M: 'branchName',
      }
    });

    // res.json({ data: result })

    ownerController
      .createVehicleOwnerByXsl([result])
      .then((data) => {
        res.status(201).send(data);
      })
      .catch((err) => {
        res.status(400).send(err);
      });

  })

});

router.post("/update-owner-by-xsl", (req, res) => {


  upload(req, res, function (err) {
    if (err) {
      res.json({ error_code: 1, err_desc: err });
      return;
    }
    /** Multer gives us file info in req.file object */
    if (!req.file) {
      res.json({ error_code: 1, err_desc: "No file passed" });
      return;
    }

    let result = excelToJson({
      sourceFile: req.file.path,
      sheets: [{
        name: 'owner_data_sheet',
        columnToKey: {
          A: 'S.No',
          B: '_id',
          C: 'name',
          D: 'address',
          E: 'district',
          F: 'state',
          G: 'phoneNumber',
          H: 'panNumber',
          I: 'email',
          
        }
      },
      {
        name: 'account_data_sheet',
        columnToKey: {
          A: '_id',
          B: 'ownerId',
          C: 'accountHolderName',
          D: 'accountNumber',
          E: 'ifscCode',
          F: 'bankName',
          G: 'branchName',
        }
      }
      ]
    });

    // res.json({ data: result })

    ownerController
      .updateVehicleOwnerByXsl([result])
      .then((data) => {
        res.status(201).send(data);
      })
      .catch((err) => {
        res.status(400).send(err);
      });

  })

});


// get all onboarded owner details
router.get("/get-all-states", (req, res) => {
  res.status(201).send({ states });
});

// get all onboarded owner details
router.get("/get-owner-details", (req, res) => {
  ownerController
    .findAllOwnerDetails()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get all onboarded owner phonenumber
router.get("/get-owner-phoneNumbers", (req, res) => {
  ownerController
    .findAllOwnerPhoneNumbers()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get onboarded owner details by id
router.get("/get-owner-details/:id", (req, res) => {
  ownerController
    .findOwnerDetailsById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get onboarded owner & account details details by id
router.get("/get-owner-bank-details/:id", (req, res) => {
  ownerController
    .getOwnerBanksById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get onboarded owner & vehicle details details
router.get("/getTotalOwnerdetails", (req, res) => {
  ownerController
    .getTotalOwnerdetails(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get owner name and id details
router.get("/get-owner-name", (req, res) => {
  ownerController
    .getOwnerNames()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// get onboarded owner & account details details by id
router.get("/get-owner-bank-details", (req, res) => {
  ownerController
    .getAllOwnerWithBanks(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// edit owner details
router.put("/update-owner-details/:id", (req, res) => {
  ownerController
    .updateOwnerDetailsById(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});



// delete onboarding owner details by id
router.delete("/delete-owner-details/:id", (req, res) => {
  ownerController
    .deleteOwnerDetailsById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// delete onboarding owner details by id
router.delete("/delete-owner/:id", (req, res) => {
  ownerController
    .deleteOwnerById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

module.exports = router;
