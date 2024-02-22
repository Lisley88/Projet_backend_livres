const express = require('express');
const router = express.Router();
//configurer notre router
const userCtrl = require('../controllers/userCtrl');
//Créer 2 routes avec post parce que le frontend va également envoyer des informations(email et motdepass)
router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);

module.exports = router;