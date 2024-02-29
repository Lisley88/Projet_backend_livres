const sharp = require("sharp");
const fs = require("fs");

const sharpImage = (req, res, next) => {
    if (req.file) {
        const newFileName = req.file.filename.replace(/\.[^.]+$/, ".webp");
        sharp(req.file.path)
            .webp({ quality: 80 })
            .toFile(`images/${newFileName}`)
            .then(() => {
                // Remplacer le fichier original
                fs.unlink(req.file.path, () => {
                    req.file.path = `images/${newFileName}`;
                    req.file.filename = newFileName;
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
