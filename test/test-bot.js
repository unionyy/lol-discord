const Discord = require('discord.js');
const client = new Discord.Client();
const lol = require('../dist/lol-discord.js');

const token = 'Nzk5MDk4Nzc0ODA2MDY5MjQ5.X_-oug.KvLP3d4syQzyDto0x5KjwOZaexI';

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  lol.SetLanguage("ko");
  lol.SetLocale("kr");
});

client.on('message', msg => {
  if (msg.content === 'ping') {
    msg.reply('pong');
  }

  if(msg.content[0] == '롤' && msg.content.length > 2 && msg.content.length < 20) {
    summoner = msg.content.slice(2);
    /** Send Searching message */
    msg.reply("\""+summoner+"\" 검색중...").then(msg_searching => {
      /** Call "lol(summoner name)" */
      lol.Search(summoner).then(embed_msg => {
          /** If User Exist, embed message is generated */
          msg_searching.delete();
          msg.reply({embed: embed_msg});
      }).catch(err => {
          /** If User Not Exist or Error occur, Error message is generated */
          msg_searching.delete();
          msg.reply(err);
      });
    });
  }
});

client.login(token);