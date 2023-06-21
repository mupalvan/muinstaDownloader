const Insta = require('./insta.js');
const client = new Insta.Client();
const chatbot = require("node-fetch").default;
const axios = require('axios')
const imageDownloader = require('node-image-downloader')
const { parse } = require("node-html-parser");
const console = require('console');
const fs = require('fs');
/////////////////////////   Database    ////////////////////////////////////////
// var sqlite3 = require('sqlite3').verbose();
// let db = new sqlite3.Database('./allUserJoin.db', sqlite3.OPEN_READWRITE);
// function insertTo(username){
//     db.run('INSERT INTO `userJoin` (`username`) VALUES (?)', [username], function(err) {
//         if (err) {
//           return console.log(err.message);
//         }
//     });
// }
/////////////////////////   Functions   ////////////////////////////////////////
// async function chatCreator(userID) {
//   try{
//     const user = await client.fetchUser(userID);
//     if(!user.privateChat) await user.fetchPrivateChat();
//     user.privateChat.sendMessage('به ربات خوش آمدید');
//     insertTo(userID);
//   }catch(err){}
// }

async function getPostLink(url, chatID) {
    try{
        url = url.split('?')[0] + 'embed' + '/captioned';
    
        let res = axios.get(url).then(async (response) => {
            const root = parse(response.data);
            let link = "";
            if (response.data.search("video_url") != -1)
                link = getVideoLinkFromHtml(response.data);
            else
                link = root.querySelector('img.EmbeddedMediaImage').getAttribute("src");
    
            while (link.search("&amp;") != -1) {
                link = link.replace("&amp;", "&");
            }
            if(link.search(".mp4?")!=-1){
                let server = "https://mudownloader.ir/p.php/";
                let urlSending = server+link.split('https://')[1];
                sendMessageToUser(chatID, urlSending);
            }else{
                imageSender(link, chatID);
            }
        });
    }catch(err){}
} //Finish

function getVideoLinkFromHtml(html) {
    try{
        let crop = "{\"" + html.substring(html.search("video_url"), html.search("video_url") + 1000);
        crop = crop.substring(0, crop.search(",")) + "}";
        return JSON.parse(crop).video_url;
    }catch(err){}
}//Finish

function checkLink(message){
  try{
    (async ()=>{
        const instagramPostLink = message.content;
        await getPostLink(instagramPostLink, message.chatID);
    })();
  }catch(err){}
}//Finish

function sendMessageToUser(chaID, message, type){
    client.fetchChat(chaID).then((chat) => {
        try{
            if(type=='image'){
                chat.sendPhoto(message);
                try {
                    fs.rmdirSync('./files/'+chaID, { recursive: true });
                }catch (err) {}
            }else{
                chat.sendMessage(message);
            }
        }catch(err){}
    });
}//Finish

function imageSender(url, chatID){
    try{
        sendMessageToUser(chatID,'...پست شما در حال ارسال است لطفا کمی صبر کنید');
        const filename = url.split("/")[5].split(".mp4?")[0].split(".jpg?")[0].split(".webp?")[0];
        const dir = './files/'+chatID+'/';
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, {
                recursive: true
            });
        }
        imageDownloader({
        imgs: [
            {
            uri: url,
            filename: filename
            }
        ],
        dest: './files/'+chatID+'/',
        })
        .then((info) => {
            if(info[0].path.substr(-4)=='jpeg'){
                sendMessageToUser(chatID, './'+info[0].path, 'image');
            }
        })
        .catch((error, response, body) => {
            sendMessageToUser(chatID,'😢با عرض پوزش ربات فعلا قادر به دانلوداین پست های(اسلاید) نمیباشد');
        })
    }catch(err){
    }
}//Finish

/////////////////////////   Message Control    /////////////////////////////////
client.on('connected', async () => {
    console.log(`${client.user.username} Is Ready Now For Chats`);
    client.on('pendingRequest', async data => {
      try{
        const myString = Object.values(data);
        const ary = myString;
        const arry = ary.map((character) => character);
        var ss = JSON.stringify(arry);
        var parsedData = JSON.parse(ss);
        let userid = String(parsedData[1]);
        sendMessageToUser(userid,'😁به ربات ما خوش آمدید 😍 چون شما برای اولین بار وارد ربات شدید لطفا لینک پست خود را مجدد ارسال کنیذ');
      }catch(err){}
    });
});

client.on('messageCreate', (message) => {
    try{
        let va = 0;
        if (message.author.id === client.user.id){
            va = 1;
            message.markSeen();
        }
        if(message.content.toLowerCase().includes('help')){ 
            va = 1;
            sendMessageToUser(message.chatID,'برای دانلود پست های کافیست لینک پست ها رو کپی کنید و برای ربات ارسال کنید\nاز طریق لینک زیر نیز میتوانید آموزش تصویری ربات را مشاهده\n @mudownloader');
        }
        if(message.content.split('/')[2]=='www.instagram.com'){ 
            va = 1;
            checkLink(message);
        }
        if(va==0){
            sendMessageToUser(message.chatID,'متعصفانه پیام شما برای ربات قابل هضم نیست 🤮 لطفا لینک پست مورد نظرتون رو ارسال کنید 😅(اگر با ربات آشنایی ندارید در پیج آموزش ربات گذاشته شده اون رو مشاهده کنید🧐)');
            sendMessageToUser(message.chatID,'لطفا در نظر داشته باید ربات فعلا فقط قادر به دانلود عکس و ویدیو میباشد که عکس به صورت مستقیم و ویدیو به صورت لینک فرستاده میشوند (آموزش دانلود ویدیو و عکس رو میتونید در پیج مشاهده کنید) بعضی از پست ها ب دلیل فرمت نا مشخص دانلود نمیشوند   ');
        }
    }catch(err){}
});

/////////////////////////   LogIN   ////////////////////////////////////////////
client.login('zizifa_2001', 'mumu1379');
