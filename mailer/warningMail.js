const mailer = require('./index');
const System = require('../src/models/system');
const {User} = require('../src/models/user');

module.exports = async function sendWarningMail(sysID) {
    try {
        const sys = await System.findById(sysID, 'userID');
        const user = await User.findById(sys.userID, 'email');
        const content = 'Chúng tôi phát hiện thấy thông số bất thường trong nhà bạn. Vui lòng kiểm tra!';
        mailer.sendEmail(user.email, 'FIRE WARNING', content, (err, info)=>{
            if(err) throw err
            console.log('Send mail: ', info.response);
        })
    } catch (error) {
        console.log(error)
    }

}