const axios = require('axios');
const qrcode = require('qrcode-terminal');

const { Client, LocalAuth } = require('whatsapp-web.js');
const client = new Client({ authStrategy: new LocalAuth() ,puppeteer: {
                args: ['--no-sandbox'],
        }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true});
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async message => {

    var chat = await client.getChatById(message.from);
    chat.sendStateTyping();
//    message.sendStateTyping();
    const contactnumber = message.from.split('@');
    const url = 'http://sudu.ai:8000/rest/v1/contact?contact_number=eq.'+ contactnumber[0] + '&select=*';
    axios.get(url, {
        headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyAgCiAgICAicm9sZSI6ICJhbm9uIiwKICAgICJpc3MiOiAic3VwYWJhc2UtZGVtbyIsCiAgICAiaWF0IjogMTY0MTc2OTIwMCwKICAgICJleHAiOiAxNzk5NTM1NjAwCn0.dc_X5iR_VP_qT0zsiyj_I_OZ2T9FtRU2BBNWN8Bu4GE',
        }
    }).then(function (response) {
      console.log(response)
      if(response.data[0] != null){
         axios.post(
           'https://sryms0dnpssf9w-8080.proxy.runpod.net/chat',
           '',
         {
            params: {
                'msg': message.body,
                'database_name': 'test_data',
                'collection': 'table16'
           },
           headers: {
             'accept': 'application/json',
             'content-type': 'application/x-www-form-urlencoded'
           }
         }).then(function (data){
             console.log(data.data.result);
             message.reply(data.data.result);
             clearInterval();
         }).catch(function (errors){
             console.log(errors);
         });

//        message.reply('fuck u dont talk too much..');
      } else {
         client.sendMessage(message.from, 'You are not a valid user');
      }
    }).catch(function (error) {
            console.log(error);
    });

//      console.log(contactnumber[0]);
//      console.log(response.body);

});

 
client.initialize();