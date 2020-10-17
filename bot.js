const mineflayer = require("mineflayer")
const tokens = require('prismarine-tokens-fixed')
const config = require(`./config.json`);
const tpsPlugin = require('mineflayer-tps')(mineflayer)
const {Vec3} = require("vec3")
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
    tokens.use(loginOpts, function (_err, _opts) {
        const bot = mineflayer.createBot(_opts);
        bot.loadPlugin(tpsPlugin);
        const ChatMessage = require("prismarine-chat")(bot.version)  //自動偵測訊息版本
        bot.on("message", async function (jsonMsg) {
            const whitelist =["Minecraft ID","123","Miku_probot"]
            const message = new ChatMessage(jsonMsg)
            const msg = new webhook.MessageBuilder()
                .setText(`[${bot.username}:]`+message.toString())
                .setAvatar(
                    `https://cravatar.eu/helmavatar/${bot.username}/190.png`
                )
                .setName(`${bot.username}`)
            const health = /目標生命 \: ❤❤❤❤❤❤❤❤❤❤ \/ ([\S]+)/g.exec(message.toString()) //忽略系統的目標生命
            if(health){
                console.log(`偵測到系統訊息`)
            }else {
                console.log(message.toAnsi())
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
                //msg[1]
                //  if (playerid[0] === bot.username) return;
                if (whitelist.includes(`${playerid[0]}`)) {
                    switch (msg[1]) {
                        case "spawn":
                            bot.chat(`/spawn`)
                            break
                        case "back":
                            bot.chat(`/back`)
                            break
                        case "cmd":
                            let cmd = msg.join(" ").slice(msg.length - msg[1].length - 3)
                            bot.chat(cmd)
                            break
                    }
                }
            }
        })
        bot.once("login",()=>{
            setTimeout(function () {
                bot.creative.flyTo(bot.entity.position.offset(1, 0, 0))//升高0.01格
                bot.chat(`/spawn`)
            }, 3000)
            rl.on('line', function (line) {
                bot.chat(line)
            })
        })
        bot.on("end",()=>{
            connects() //重連 ,discord bot 中斷登入狀態
        })
        bot.on("death",async function (){
            setTimeout(function (){
                bot.chat(`/back`)
            },3000)
        })
    })
}
connects()  //登入