const Discord = require('discord.js');
const client = new Discord.Client();
const lol = require('../dist/lol-discord.js');

const token = 'Discord Bot Token';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }

  if(msg.content[0] == '롤' && msg.content.length > 2 && msg.content.length < 20) {
    summoner = msg.content.slice(2);
    msg.reply("\""+summoner+"\" 검색중...").then(msg_searching => {
        lol(summoner).then(embed_msg => {
            msg_searching.delete();
            msg.reply(embed_msg);
        });
    });
  }
});

client.login(token);