const sharp = require("sharp");//module pour traiter l'image
const fs = require("fs");

const sharpImage = (req, res, next) => {
    if (req.file) {
        //on extrait le nom du fichier d'origine avant l'extension et on ajoute l'horodatage et l'extension webp
        const newFileName = req.file.filename.replace(/\.[^.]+$/, ".webp");
        //On utilise sharp pour redimensionner le fichier et convertir en webp
        sharp(req.file.path)
            .resize({width: 412,
                     height: 520,
                      fit: "cover"})
            .webp({ quality: 80 })
            .toFile(`images/${newFileName}`)
            .then(() => {
                // Remplacer l'image origine
                fs.unlink(req.file.path, () => {
                    req.file.path = `images/${newFileName}`;
                    req.file.filename = newFileName;
                     //Si audun fichier est dans la requête on peu continuer sans conversion
                    next();
                });
            })
            .catch((error) => {
                res.status(400).json(error);
                return next();
            });
    }
};

module.exports = sharpImage;
