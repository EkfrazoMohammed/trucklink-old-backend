const express = require("express");
const router = express.Router();
const AuthController = require("../controller/common-controller/auth-controller");


// User-Login route
router.post("/login", (req, res) => {

  AuthController.userLogin(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// user forget-password
router.post("/forget-password", (req, res) => {
  AuthController.forgetPassword(req.body.email, req.headers.origin)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// User-Logout route
router.put('/logout/:id', (req, res) => {
  AuthController.userLogout(req.params.id).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

//Reset-password
router.put('/change-password', (req, res) => {
  AuthController.changePassword(req.body).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

router.put('/reset-password', (req, res) => {
  AuthController.resetPassword(req.body).then((data) => {
    res.status(201).send(data);
  }).catch((err) => {
    res.status(400).send(err);
  });
});


module.exports = router;
