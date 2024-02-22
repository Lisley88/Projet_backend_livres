const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();

const bookCtrl = require('../controllers/bookCtrl');

router.get('/', bookCtrl.getAllBooks );
router.get('/:id', bookCtrl.getOneBook);
router.get('/bestrating', bookCtrl.getBestBooks);
router.post('/', bookCtrl.createBook);
router.post('/:id/rating', bookCtrl.rateBook);
router.put('/:id', bookCtrl.modifyBook );
router.delete('/:id', bookCtrl.deleteBook );


module.exports = router;