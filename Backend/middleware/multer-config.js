//Importer multer: module pour gérer le téléchargement de fichiers dans les applications Express
const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

//Créer un objet de configuration pour multer. diskStorage=on va l'enregistrer sur le disk.
const storage = multer.diskStorage({
  destination: (req, file, callback) => { //quelle dossier enregistrer les dossiers
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({ storage }).single('image');