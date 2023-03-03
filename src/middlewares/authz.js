const jwt = require('jsonwebtoken');
require('dotenv').config();

const Authz = {

    verifyToken : (req, res, next) => {
        const token = req.rawHeaders[1];
      
        if(token){
            const accessToken = token.split(' ')[1];
            jwt.verify(accessToken, process.env.ACCESS_SECRET_KEY, (err, user) => {
                if(err)
                    return res.status(403).json({message:'token is not valid'});
                req.user = user;
                return next();
            });
        }
        else return res.status(401).json({message:'you are not authenticated'});

    }

}

module.exports = Authz;