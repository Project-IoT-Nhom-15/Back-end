const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const Authz = require('../middlewares/authz');

module.exports = function route(app){

    app.post('/login', authController.login);

    app.post('/register', authController.register);

    app.get('/logout', Authz.verifyToken, authController.logout);

    app.post('/change-password', Authz.verifyToken, authController.changePassword);

    app.get('/user', Authz.verifyToken, userController.getProfile);

    app.post('/update-profile', Authz.verifyToken, userController.updateProfile)

    app.get('/system/:id', Authz.verifyToken, userController.getSystem);

    app.get('/systems', Authz.verifyToken, userController.getAllSystems);
    // app.post('/create', userController.create);
    
    
    app.get('/system-params/:id', Authz.verifyToken, userController.getParams);

    app.get('/system-state/:id', Authz.verifyToken, userController.controlState);

    app.get('/system-name/:id', Authz.verifyToken, userController.changeSystemName);






}

