const { time } = require('console');
const {MessageEmbed} = require('discord.js');
const https = require('https');
const urlencode = require('urlencode');

const { PROFILEICONURI, QUEUETYPE, CHAMPION, LANG, LOCALE } = require('./constants');
var lang = require('./language/ko');
var locale = 'kr';

function HttpsReq(_platform, _name) {
    const options = {
        hostname: "www.lolog.me",
        port: 443,
        path: "/" + _platform + "/shortcut/" +_name,
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    };
    return new Promise((resolve, reject) => {
        const req = https.get(options, (res) => {
            res.setEncoding('utf-8');

            var _res = '';
            res.on('data', (d) => {
                //process.stdout.write(d); // If you want to print res
                _res += d;
            });
            res.on('end', () => {
                if(_res) {
                    try{
                        resolve({code: res.statusCode, json: JSON.parse(_res)});
                    } catch(err) {
                        reject(err);
                    }
                } else {
                    reject();
                }
                
            });
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
}

module.exports.SetLanguage = function(_lang) {
    if(LANG.includes(_lang)) {
        lang = require('./language/' + _lang);
        return;
    } else throw `"${_lang}" Not Support Langauge`;
}

module.exports.SetLocale = function(_locale) {
    if(LOCALE.includes(_locale)) {
        locale = _locale;
        return;
    } else throw `"${_locale}" Wrong Locale`;
    
}

module.exports.Search = async function(summoner) {
    try{
        /** Get Data From LoLog.me */
        const data = await HttpsReq(locale, urlencode.encode(summoner));

        /** No User */
        if(data.code == 404) {
            throw 404;
        }

        /** Cannot Get Data from LoLog.me */
        if(data.code != 200) {
            throw data.code;
        }

        const user = data.json;
        sr_text = user.solo_tier;
        if(user.solo_rank !== "none") sr_text += ' '+user.solo_rank;
        fr_text = user.flex_tier;
        if(user.flex_rank !== "none") fr_text += ' '+user.flex_rank;

        /** Update Time */
        let updateText = "";
        let timeDel = (new Date() - new Date(user.update_time)) / 60000; // Min ago
        if(timeDel / 60 < 1) updateText += parseInt(timeDel) + lang.EMBED.min ;
        else if(timeDel / 1440 < 1) updateText += parseInt(timeDel / 60) + lang.EMBED.hour ;
        else updateText += parseInt(timeDel / 1440) + lang.EMBED.day;

        const embed = new MessageEmbed()
            .setColor('#38b259')
            .setTitle(user.summoner_name)
            .setURL(`https://lolog.me/${locale}/user/` + urlencode.encode(user.summoner_name))
            .setAuthor('LoLog.me', null, 'https://lolog.me/')
            .setDescription('\u200B')
            .setThumbnail(PROFILEICONURI + user.profile_icon_id + '.png')
            .addFields(
                { name: lang.EMBED.solo, value: sr_text, inline: true  },
                { name: lang.EMBED.flex, value: fr_text, inline: true  },
                { name: lang.EMBED.update, value: updateText + ` [${lang.EMBED.update}](https://lolog.me/${locale}/user/${urlencode.encode(user.summoner_name)})`, inline: true  },
                { name: '\u200B', value: '\u200B' }
            );

            /** Matches */
            let recent_text = "";
            for(const match of user.matches) {
                const part = match.participant;
                /** Win */
                if(part.win_my & 1) recent_text += `\`\`\`ini\n[${lang.EMBED.victory}] `;
                else recent_text += `\`\`\`scss\n[${lang.EMBED.defeat}] `;
                /** Time */
                timeDel = (new Date() - new Date(match.start_time)) / 60000; // Min ago
                if(timeDel / 60 < 1) recent_text += parseInt(timeDel) + lang.EMBED.min + " | ";
                else if(timeDel / 1440 < 1) recent_text += parseInt(timeDel / 60) + lang.EMBED.hour + " | ";
                else recent_text += parseInt(timeDel / 1440) + lang.EMBED.day + " | ";
                /** Queue Type */
                recent_text += lang.QUEUETYPE[QUEUETYPE[match.queue_id]] + " | ";
                /** Duration */
                recent_text += `${parseInt(match.duration/60)}:${(match.duration % 60).toString().padStart(2,'0')} | `
                /** Champion */
                recent_text += lang.CHAMPION[CHAMPION[part.champ_id]] + '\n';
                /** KDA */
                recent_text += `KDA: ${part.kills}/${part.deaths}/${part.assists} (${parseInt(100 * (part.kills + part.assists) / part.total_kills)}%) | `;
                /** CS */
                recent_text += `CS: ${part.minion_killed + part.jungle_killed}(${((part.minion_killed + part.jungle_killed) / (match.duration / 60)).toFixed(1)}) | `;
                /** Gold */
                recent_text += "Gold: " + part.gold_earned + "\n```";
            }

            embed.addField(lang.EMBED.recent, recent_text || lang.EMBED.none).setTimestamp().setFooter('Data from LoLog.me', 'https://lolog.me/favicon/favicon-16x16.png');
        return embed

    } catch (err) {
        /** Fail to get Data */
        if(err === 404) throw `"${summoner}" ${lang.ERR.notFound}`
        console.log(err);
        throw lang.ERR.fail;
    }
}