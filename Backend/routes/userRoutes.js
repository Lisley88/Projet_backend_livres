const express = require("express");
const router = express.Router();
// Configurer notre router
// Importer les utilisateurs du contrôleur
const userCtrl = require("../controllers/userCtrl");
//Créer 2 routes avec post permettant de gérer l'authentification et l'enregistrement des utilisateurs dans l'application 
router.post("/signup", userCtrl.signup);
router.post("/login", userCtrl.login);

module.exports = router;
