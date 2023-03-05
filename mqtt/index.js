const mqtt = require('mqtt');
const brokerInfo = require('../configs/mqtt.config')
const System = require('../src/models/system')
const Param = require('../src/models/param')
const sendWarningMail = require('../mailer/warningMail');


function getMQTTClient(){
    const client = mqtt.connect(
        `mqtt://${brokerInfo.HOST}:${brokerInfo.PORT}`, {
        clientId: brokerInfo.CLIENT_ID,
        clean: true,
        connectTimeout: 4000,
        reconnectPeriod: 1000
    });
    return client;
}

function use(){
    const client = this.getMQTTClient();
    let warn = 0;
    const [DataTopic, StateTopic, CommandTopic] = [brokerInfo.DATA_TOPIC, brokerInfo.STATE_TOPIC, brokerInfo.COMMAND_TOPIC];
    
    client.on('connect', () => {
        console.log(`Connected to Broker ${brokerInfo.HOST} port ${brokerInfo.PORT}`)
        client.subscribe([DataTopic, StateTopic], () => {
          console.log(`Subscribed to topic ${DataTopic} and ${StateTopic}`);
        })
      })
      
    // Xử lý dữ liệu gửi tới
    client.on('message', async function(topic, payload){
        try {
            // Nếu phần cứng gửi dữ liệu lên
            if(topic == DataTopic){
                // Lấy dữ liệu
                const data = JSON.parse(payload.toString())
                console.log(data)
            
                const sysID = data.deviceid;
                const temp = (+ data['temperature']).toFixed(2)
                const humid = (+ data['humidity']).toFixed(2)
                const fire = + data['fire']
                const gas = + data['gas']
                console.log('------------------------------------')
                console.log(`Recieve data from ${sysID}: \n\t- Temp: \t${temp}\n\t- Humidity: \t${humid}\n\t- Fire: \t${fire}\n\t- Gas: \t\t${gas}\n`);
            
                // Đánh giá độ nguy hiểm theo độ ưu tiên fire > gas > temp and humi
                var response = {};
                response['type'] = "warning"
                response['deviceid'] = sysID
            
                if(humid < 0){ //fix
                    response['hasHumid'] = 1
                    //response['danger'] = 1
                }
                else response['hasHumid'] = 0
            
                if(temp > 30){ // fix
                    response['hasTemp'] = 1
                    response['danger'] = 1
                }
                else response['hasTemp'] = 0
            
                if(gas > 1200){
                    response['hasGas'] = 1
                    response['danger'] = 1
                }
                else{
                    response['hasGas'] = 0
                }
            
                if(fire < 3500){
                    response['hasFire'] = 1
                    response['danger'] = 1
                }
                else{
                    response['hasFire'] = 0
                }
            
                if(!response['danger']){
                    response['danger'] = 0
                }

                console.log(response);

                const nData = {
                    fire: fire, temp: temp,
                    humid: humid, gas:gas, 
                    systemID: sysID, warning: response['danger'] == 1 ? true : false
                }
                // Lưu dữ liệu vào db
                const param = await Param.create(nData);
                if(!param) console.log('save data of params to database failed');
                
                
                if(warn == 0 && response.danger == 1){
                    await sendWarningMail(sysID);
                    warn = 1;
                }
                else if(response.danger == 0) warn = 0;
            
                // Gửi lại dữ liệu vào kênh command
                client.publish(CommandTopic, JSON.stringify(response), {qos: 0, retain: false}, (error) => {
                if(error){
                    console.error(error)
                }
            
                console.log(`Send result to topic ${CommandTopic}\n\t- Has temp: \t${response['hasTemp']}\n\t- Has humid: \t${response['hasHumid']}\n\t- Has fire: \t${response['hasFire']}\n\t- Has gas: \t${response['hasGas']}\n\t- Danger: \t${response['danger']}\n`);
                })
            }
            
            // Nếu phần cứng báo cáo thay đổi trạng thái
            if(topic == StateTopic){
                // Cập nhật trạng thái mới trên cơ sở dữ liệu
                const data = JSON.parse(payload.toString())
                console.log(data)
            
                // trạng thái mới của hệ thống
                const newState = data.state
                const sysID = + data.systemID
                console.log(sysID, newState);

                // Update vào db
                const sys = await System.findOneAndUpdate({_id: sysID}, {state: newState});
                if(!sys) console.log("Update system state failed!");

            }
        } catch (error) {
            console.log(error)
        }
 
    })
}

module.exports = {getMQTTClient, use};