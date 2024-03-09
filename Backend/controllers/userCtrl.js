require('dotenv').config();
const bcrypt = require('bcrypt')
const User = require ('../models/User');
const jwt = require('jsonwebtoken');

// L'adresse mail doit être au format string@string.string
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Le mot de passe doit faire entre 8 et 20 caractères, il doit contenir
// au minimum un chiffre, une majuscule et une minuscule
const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,20}$/;
// La fonction signup pour l'enregistrement de nouveaux utilisateurs.
exports.signup = (req, res, next)=> {
    if (!emailRegex.test(req.body.email)) {
        return res.status(410).json({message:"Email non conforme"})
    }
    if (!passwordRegex.test(req.body.password)) {
        return res.status(410).json({message:"Mote de passe incorrect"})
    }
    //la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois. 
    bcrypt.hash(req.body.password,10)
    .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash,
        });
        user.save() //enregistre dans le base de donnée en utilisant save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

//La fonction login pour connecter des utilisateurs existants
exports.login = (req, res, next)=> {
    User.findOne({ email: req.body.email })
    .then((user) => {
        if(!user) {
            res.status(401).json({message:'Utilisateur non trouvé !'})
        } else {
            //compare un string avec un hash pour, par exemple, 
            //vérifier si un mot de passe entré par l'utilisateur 
            //correspond à un hash sécurisé enregistré en base de données.
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                 res.status(401).json({ message: 'Mot de passe incorrecte' });
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                            process.env.SECRET_TOKEN, //clé secret
                           { expiresIn: '24h' }   //configuration d'expiration

                        )
                    });
                }
            })
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error => {
        res.status(500).json({error});
    })
};