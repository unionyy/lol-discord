# LoL Discord

## League of Legends Match History for Discord Bot

## About
lol-discord is node.js module that make Discord embed message for League of Legends match history.

![capture](/images/capture.png)


## Installation
[Discord.js](https://discord.js.org/) v12 is recommended.

```sh-session
npm install lol-discord
```

## Usage

### Import Package
```javascript
const lol = require('lol-discord');
```

### Set Language
```javascript
lol.SetLanguage("ko");
// en or ko
// Default: ko
```

### Set Locale
```javascript
lol.SetLocale("kr");
// LOCALE: ['kr', 'br1', 'eun1', 'euw1', 'jp1', 'la1', 'la2', 'na1', 'oc1', 'tr1', 'tr1', 'ru']
// Default: kr
```

### Search Summoner
```javascript
lol.Search("hide on bush").then(embed_msg => {
          msg.reply({embed: embed_msg});
      }).catch(err => {
          msg.reply(err);
      });
```

## Example
```javascript
const lol = require('lol-discord');
    ...
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
```

## Links
* [Discord.js](https://discord.js.org/)
* [LoLog.me](https://lolog.me/)
* [앵무새](https://koreanbots.dev/bots/795333228662751253)
