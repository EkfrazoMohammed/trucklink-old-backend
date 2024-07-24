const express = require("express");
const router = express.Router();
const challanController = require("../controller/challan-controller/get-challan-data-controller");

// Read dispatch challan data
router.post("/get-challan-data", (req, res) => {
  
  challanController
    .findAllDispatchChallans(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

//Get challan print data
router.post("/get-all-challan-data", (req, res) => {
  
  challanController
    .findAllDispatchChallansPrintData(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});



// Read dispatch challan data for acknwoledgement
router.get("/get-acknowledgement-register", (req, res) => {
  challanController
    // .findChallanData(true,req.query)
    .getAckData(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read dispatch challan data for receive register
router.get("/get-receive-register", (req, res) => {
  
  challanController
    // .findChallanData(null,req.query) 
    .getRcvData(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read dispatch challan data by id
router.get("/get-challan-data/:id", (req, res) => {
  challanController
    .findOwnerDispatchChallansById(req.params.id)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read  all Delivery numbers
router.get("/get-all-delivery-numbers", (req, res) => {
  challanController
    .getAllDeliveryNumber(req.query)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Visualtion 
router.get("/get-material-type-chart", (req, res) => {
    
  challanController
    .getAllMaterialTypeByChart(req.query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    }); 
});

//all header Visualtion 
router.get("/get-all-header-visualtion", (req, res) => {
    
  challanController
    .getAllHeaderVisulation(req.query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    }); 
});

// Expendes Visualtion 
router.get("/get-expenses-visualtion", (req, res) => {
    
  challanController
    .getMonthYearExpensesVisulation(req.query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    }); 
});

// Expendes Visualtion 
router.get("/get-earning-visualtion", (req, res) => {
    
  challanController
    .getAllEarningVisulation(req.query)
    .then((data) => {
      res.status(200).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    }); 
});

module.exports = router;
