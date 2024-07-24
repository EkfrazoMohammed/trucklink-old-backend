const express = require("express");
const router = express.Router();
const userController = require("../controller/common-controller/user-controller");

// Create user
router.post("/create-user", (req, res) => {
  userController
    .createUser(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read User by Id
router.get("/users/:userId", (req, res) => {
  userController
    .findUserById(req.params.userId)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Read all User
router.get("/users", (req, res) => {
  userController
    .findUsers()
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update user
router.put("/update-user/:userId", (req, res) => {
  userController
    .updateUser(req)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Update status
router.put("/user-status", (req, res) => {
  userController
    .updateUserStatus(req.body)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

// Delete user
router.delete("/delete-user/:userId", (req, res) => {
  userController
    .deleteUser(req.params.userId)
    .then((data) => {
      res.status(201).send(data);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

router.get("/server-check", (req, res) => {
  res.status(201).send("Server is up and running brother !!!!!");
});

module.exports = router;
