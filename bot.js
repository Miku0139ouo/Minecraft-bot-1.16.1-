const mineflayer = require("mineflayer")
const tokens = require('prismarine-tokens-fixed')
const config = require(`./config.json`);
const loginOpts = {   //登入版本
    host: config.address,
    port: config.port,
    username: config.username,
    password: config.password,
    tokensLocation: './tokens_saves.json',
    tokensDebug: true,
    version: "1.16.1"
}
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});
async function connects() {
    tokens.use(loginOpts, function (_err, _opts) { //使用驗證暫存
        const bot = mineflayer.createBot(_opts);
        bot.on("message", async function (jsonMsg) {
            const whitelist = config.whitelist
            const health = /目標生命 \: ❤❤❤❤❤❤❤❤❤❤ \/ ([\S]+)/g.exec(jsonMsg.toString()) //忽略系統的目標生命
            if(health){
                //console.log(`偵測到系統訊息`)
            }else {
                console.log(sonMsg.toAnsi())
            }
            if (jsonMsg.toString().startsWith(`[廢土伺服] :`) &&
                jsonMsg.toString().toLowerCase().includes(`想要你傳送到 該玩家 的位置!`)){ //切訊息
                let dec = jsonMsg.toString().split(/ +/g);
                let playerid = dec[2] //2
                if(whitelist.includes(playerid)){
                    bot.chat(`/tok`)
                }else {
                    bot.chat(`/tno`)
                }
            }
            if(jsonMsg.toString().startsWith(`[廢土伺服] :`) &&
                jsonMsg.toString().toLowerCase().includes(`想要傳送到 你 的位置`)){  //切訊息
                let dec = jsonMsg.toString().split(/ +/g);
                let playerid = dec[2] //2
                if(whitelist.includes(playerid)){
                    bot.chat(`/tok`)
                }else {
                    bot.chat(`/tno`)
                }
            }
            if (jsonMsg.toString().startsWith(`[收到私訊`)) {  //切訊息
                let dec = jsonMsg.toString().split(/ +/g);
                let lo = dec[2].split(`]`)//
                let playerid = dec.splice(lo.length)[0].split("]") //Minecraft ID
                let msg = jsonMsg.toString().slice(18 + playerid.length).split(" ")
                 if (playerid[0] === bot.username) return;
                    if (whitelist.includes(`${playerid[0]}`)) {
                        if (msg[1]) {
                        switch (msg[1]) {
                            case "spawn":
                                bot.chat(`/spawn`)
                                break
                            case "back":
                                bot.chat(`/back`)
                                break
                            case "discord":
                                bot.chat(`/m ${playerid[0]} 已開啓Discord 聯動`)
                                discord()
                                break
                            case "throwall":
                                for (let i = 9; i <= 46; i++) {
                                    bot._client.write("window_click", {
                                        windowId: 0,
                                        slot: i,
                                        mouseButton: 1,
                                        action: 1,
                                        mode: 4,
                                        item: 0
                                    })
                                }
                                break
                            case "exp":
                                let exp = Math.round(bot.experience.progress * 100)
                                bot.chat(`/m ${playerid[0]} 等級: ${bot.experience.level} , 經驗值: ${bot.experience.points}  經驗值百分比: ${exp}%`)
                                break
                            case "throw":
                                if (msg[2] !== undefined) {
                                    if (!isNaN(msg[2])) {
                                        if (msg[2] >= 9) {
                                            if (msg[2] <= 46) {
                                                bot._client.write("window_click", {
                                                    windowId: 0,
                                                    slot: msg[2],
                                                    mouseButton: 1,
                                                    action: 1,
                                                    mode: 4,
                                                    item: 0
                                                })
                                            } else {
                                                bot.chat(`/m ${playerid[0]} 數字 9-45`)
                                            }
                                        } else {
                                            bot.chat(`/m ${playerid[0]} 數字 9-45`)
                                        }
                                    } else {
                                        bot.chat(`/m ${playerid[0]} 請輸入有效數字 而並非 ${msg[2]}`)
                                        return;
                                    }
                                }
                                break
                            case "cmd":
                                if (msg[2]) {
                                    let chats = msg.join(" ").replace(msg[1], "")
                                    bot.chat(chats)
                                    break
                                }

                        }
                    }
                }else {
                        bot.chat(`/m ${playerid[0]} 你沒有權限使用 ${msg[1]} 指令`)
                    }
            }
        })
        bot.once("login",()=>{
            rl.on('line', function (line) {
                bot.chat(line)
            })
            setTimeout(function (){ //fly_toggle
                fly_toggle(false)
            },5000)
        })
        bot.on("end",()=>{
            connects() //重連
        })
        bot.on("kicked", function (reason, loggedIn) {
            console.log(`Kicked Reason: ${reason}. \nLogged In?: ${loggedIn}.`)
        })
        bot.on("death",async function (){
            setTimeout(function (){
                bot.chat(`/back`)
            },3000)
        })
        function fly_toggle(fly) {
            let flag;
            if (fly)
                flag = 2
            else flag = 0
            bot._client.write("abilities", {
                flags: flag
            })
        }
        function discord(){
            const Discord =require("discord.js")
            const client = new Discord.client();
            client.login(config.token) //請自行輸入你的Discord bot token
            client.on("message",msg=>{
                if(msg.author.bot||!msg.startsWith(config.prefix))return;
                const args = msg.content
                    .slice(config.prefix.length)
                    .trim()
                    .split(/ +/g);
                const command = args.shift().toLowerCase();
                const mss = args.join(" ").trim()
                if(command === `send`){
                    bot.chat(`${mss}`)
                }
            })
            bot.on("message", async function (jsonMsg) {
                const webhook = require("webhook-discord")
                const Hook = new webhook.Webhook(config.webhook) //請自行輸入自己的webhook 網址
                const health = /目標生命 \: ❤❤❤❤❤❤❤❤❤❤ \/ ([\S]+)/g.exec(jsonMsg.toString()) //忽略系統的目標生命
                if(health){
                    return
                }else {
                    const msg = new webhook.MessageBuilder()
                        .setName(`${bot.username}`)
                        .setText(`[機器人 ${bot.username}:]${jsonMsg.toString()}`)
                    Hook.send(msg) //webhook 内容
                }
            })
        }
    })
}
connects()  //登入
