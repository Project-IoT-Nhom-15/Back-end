const System = require('../models/system');
const Param = require('../models/param');
const {User, UserDTO} = require('../models/user');
const mqtt = require('../../mqtt');
const brokerInfo = require('../../configs/mqtt.config');

class UserController {

    // create = async(req, res) => {
    //     const data ={
    //         name: 'Nhà Tạ Quang Bửu',
    //         state: false,
    //         userID: '6400639f35f132cce1d3fe22'
    //     }

    //     const d = await System.create(data);
    //     return res.json(d);
    // }


    getAllSystems = async(req, res) =>{
        try {
            const userID = req.user._id;
            const systems = await System.find({userID: userID});
            return res.json(systems);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        } 
    }

    getSystem = async(req, res) => {
        try {
            const id = req.params.id;
            const userID = req.user._id;
            const system = await System.findById(id);

            if(!system || system?.userID != userID) 
                return res.json({message: 'you are not allowed to access'});

            return res.json(system);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getParams = async(req, res) => {
        try {
            const id = req.params.id;
            const userID = req.user._id;
            const system = await System.findById(id);

            if(!system || system?.userID != userID) 
                return res.json({message: 'you are not allowed to access'});
            else if(!system || system?.state == false)
                return res.json({message: 'system is off now'});
            
            const params = await Param.find({systemID: id}).sort({ createdAt: -1 }).limit(1);
            return res.json(params[0]);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    controlState = async(req, res) => {
        try {
            const id = req.params.id;
            const state = req.query.state;
            const userID = req.user._id;
            const system = await System.findById(id);

            if(!system || system?.userID != userID) 
                return res.json({message: 'you are not allowed to access'});

            // if(!state) state = system.state;
            console.log(state,'--------------------', system.state)
            if(state && state != system.state){
                const client = mqtt.getMQTTClient();
                const message = {
                    type: 'control',
                    deviceid: system._id.toString(),
                    state: state,
                }
                client.publish(brokerInfo.COMMAND_TOPIC, JSON.stringify(message) ,{qos: 0, retain: false}, (err) => {
                    if(err) console.error(err)
                    
                    console.log(message);
                })

                // Update vào db
                const sys = await System.findOneAndUpdate({_id: id}, {state: state});
                if(!sys) console.log("Update system state failed!");
            }

           
            
            return res.json('just changed state!');
           

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    changeSystemName = async(req, res) => {
        try {
            const [id, name] = [req.params.id, req.query.name];
            const userID = req.user._id;
            const system = await System.findById(id);

            if(!system || system?.userID != userID) 
                return res.json({message: 'you are not allowed to access'});

            if(!name)
                return res.json({message: 'missing param'});
            
            let nSystem = await System.findOneAndUpdate({_id: id}, {name: name});

            if(!nSystem)
                return res.json({message:'update failed'});
            
            nSystem = await System.findById(id);
            return res.json(nSystem);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    getProfile = async(req, res) => {
        try {
            const userID = req.user._id;

            const user = new UserDTO(await User.findById(userID));
            if(!user)
                return res.json({message: 'user does not exist'});

            const sysCount = await System.find({userID: userID}).count();
            user.count = sysCount;

            return res.json(user);

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }

    updateProfile = async(req, res) => {
        try {
            const userID = req.user._id;
            const body = req.body;
            delete body.password, body._id;

            const user = new UserDTO(await User.findById(userID));
            if(!user)
                return res.json({message: 'user does not exist'});

            const nUser = await User.findOneAndUpdate({_id: userID}, body)
            if(!nUser) return res.json({message: 'update failed'});

            nUser = await User.findById(userID);
            return res.json(new UserDTO(nUser));

        }catch(err) {
            console.log(err);
            return res.json({error: err.message});
        }
    }
}

module.exports = new UserController;