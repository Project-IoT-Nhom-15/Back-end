const {User, UserDTO} = require('../models/user');
const bcrypt = require('bcrypt')
const Util = require('../utils')

class UserController {

    login = async(req, res) =>{
        try {
            const body = req.body;

            if(body.username == '' || !body.username)
                return res.status(400).json({message: 'invalid input'});

            const user = await User.findOne({username: body.username});
            if(!user) return res.status(404).json({message: 'username doesnot exist'});

            const validPwd = await bcrypt.compare(body.password, user.password);
            if(!validPwd) return res.status(404).json({message: 'wrong password'});

            const accessToken = Util.generateAccessToken(user);
            const refreshToken = Util.generateRefreshToken(user);

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: false, // true if in deployment env
                path: '/',
                sameSite: 'strict',
            });

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
            return res.status(400).json({message: 'invalid input'});

            const usernameCheck = await User.findOne({username: body.username});
            if(usernameCheck)
                return res.status(400).json({message: 'username existed'});

            const hashedPwd = await Util.hashPwd(body.password);
            
            const user = await User.create({
                username: body.username,
                password: hashedPwd,
                email: body.email,
                name: body.name,
            });

            if(!user) return res.status(400).json({message: 'cannot create user'});

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
}

module.exports = new UserController;