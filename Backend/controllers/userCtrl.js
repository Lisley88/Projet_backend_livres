const bcrypt = require('bcrypt')
const User = require ('../models/User')
// La fonction signup pour l'enregistrement de nouveaux utilisateurs.
exports.signup = (req, res, next)=> {
    //la fonction de hachage de bcrypt dans notre mot de passe et lui demandons de « saler » le mot de passe 10 fois. 
    bcrypt.hash(req.body.password,10)
    .then(hash => {
        const user = new User({
          email: req.body.email,
          password: hash
        });
        user.save() //enregistre dans le base de donnée en utilisant save()
          .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
          .catch(error => res.status(400).json({ error }));
      })
      .catch(error => res.status(500).json({ error }));
  };

//La fonction login pour connecter des utilisateurs existants
exports.login = (req, res, next)=> {
    User.findOne({email: req.body.email})
    .then(user => {
        if(user === null) {
            res.status(401).json({message:'Paire login/mot de passe incorrecte'})
        } else {
            //compare un string avec un hash pour, par exemple, vérifier si un mot de passe entré par l'utilisateur correspond à un hash sécurisé enregistré en base de données.
            bcrypt.compare(req.body.password, user.password)
            .then(valid => {
                if(!valid) {
                    return res.status(401).json({ message: 'Paire login/mot de passe incorrecte' });
                } else {
                    res.status(200).json({
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id },
                           'RANDOM_TOKEN_SECRET', //clé secret
                           { expiresIn: '24h' }   //configuration d'expiration

                        )
                    });
                }
            })
            .catch(error => res.status(500).json({ error }));
        }
    })
    .catch(error=>{
        res.status(500).json({error});
    })
};