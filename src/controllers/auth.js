const {User, UserDTO} = require('../models/user');
const bcrypt = require('bcrypt')
const Util = require('../utils')

class AuthController {

    login = async(req, res) =>{
        try {
            const body = req.body;

            if(body.username == '' || !body.username)
                return res.json({message: 'invalid input'});

            const user = await User.findOne({username: body.username});
            if(!user) return res.json({message: 'username doesnot exist'});

            const validPwd = await bcrypt.compare(body.password, user.password);
            if(!validPwd) return res.json({message: 'wrong password'});

            const accessToken = Util.generateAccessToken(user);

            return res.json({user: new UserDTO(user), accessToken});

        }catch(err) {
            console.log(err);
            return res.status(400).json({error: err.message});
        } 
    }

    register = async(req, res) =>{
        try{
            const body = req.body;
            
            if(body.username == '' || !body.username)
            return res.json({message: 'invalid input'});

            const usernameCheck = await User.findOne({username: body.username});
            if(usernameCheck)
                return res.json({message: 'username existed'});

            const hashedPwd = await Util.hashPwd(body.password);
            
            const user = await User.create({
                username: body.username,
                password: hashedPwd,
                email: body.email,
                name: body.name,
            });

            if(!user) return res.json({message: 'cannot create user'});

            return res.json(new UserDTO(user));
        }catch(err){
            console.log(err);
            return res.status(400).json({error: err.message});
        }
    }

    logout = (req, res) => {
        console.log('logout')
        
        return res.json({message: 'logout'})
    }

    changePassword = async(req, res) => {
        try{
            const [oPw, nPw] = [req.body.oldPassword, req.body.newPassword];
            const userID = req.user._id;

            const user = await User.findById(userID);
            if(!user)
                return res.json({message: 'user does not exist'});

            if(!nPw || oPw !== user.password)
                return res.json({message: 'wrong password'});
            
            let nUser = await User.findOneAndUpdate({_id: userID}, {password: nPw});
            if(!nUser) return res.json({message: 'update password failed'})

            nUser = await User.findById(userID);
            return res.json(new UserDTO(nUser));
            
        }catch(err){
            console.log(err);
            return res.status(400).json({error: err.message});
        }
    }
}

module.exports = new AuthController;