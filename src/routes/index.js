const userController = require('../controllers/user');

module.exports = function route(app){

    app.post('/login', userController.login);

    app.post('/register', userController.register);

    app.get('/logout', userController.logout)

}

