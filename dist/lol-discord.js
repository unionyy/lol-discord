const { time } = require('console');
const {MessageEmbed} = require('discord.js');
const https = require('https');
const urlencode = require('urlencode');

const { PROFILEICONURI, QUEUETYPE, CHAMPION } = require('./constants');
const ko = require('./language/ko');

function HttpsReq(_platform, _name) {
    const options = {
        hostname: "lolog.me",
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
                        reject();
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

module.exports = async function(summoner) {
    try{
        /** Get Data From LoLog.me */
        const data = await HttpsReq("kr", urlencode.encode(summoner));

        /** No User */
        if(data.code == 404) {
            throw 404;
        }

        /** Cannot Get Data from LoLog.me */
        if(data.code != 200) {
            throw "검색 실패";
        }

        const user = data.json.userData;
        sr_text = user.solo_tier;
        if(user.solo_rank !== "none") sr_text += ' '+user.solo_rank;
        fr_text = user.flex_tier;
        if(user.flex_rank !== "none") fr_text += ' '+user.flex_rank;

        const embed = new MessageEmbed()
            .setColor('#38b259')
            .setTitle(user.real_name)
            .setURL('https://lolog.me/kr/user/' + urlencode.encode(user.real_name))
            .setAuthor('LoLog.me', null, 'https://lolog.me/')
            .setDescription('\u200B')
            .setThumbnail(PROFILEICONURI + user.profile_icon_id + '.png')
            .addFields(
                { name: '최근 1년간', value: user.game_count + '판', inline: true  },
                { name: '솔로 랭크', value: sr_text, inline: true  },
                { name: '자유 랭크', value: fr_text, inline: true  },
                { name: '\u200B', value: '\u200B' }
            );

            /** Match games & details */
            var details = {};
            for(detail of data.json.partData) details[detail.game_id] = detail;

            var recent_text = "";
            for(game of data.json.gameData) {
                if(!details[game.game_id]) continue;
                detail = details[game.game_id];

                /** Win */
                if(detail.win_my & 1) recent_text += "```ini\n[승리] ";
                else recent_text += "```scss\n[패배] ";
                /** Time */
                timeDel = (new Date() - new Date(game.play_time)) / 60000; // Min ago
                if(timeDel / 60 < 1) recent_text += timeDel + "분 전 | ";
                else if(timeDel / 1440 < 1) recent_text += parseInt(timeDel / 60) + "시간 전 | ";
                else recent_text += parseInt(timeDel / 1440) + "일 전 | ";
                /** Queue Type */
                recent_text += ko.QUEUETYPE[QUEUETYPE[game.queue_type]] + " | ";
                /** Duration */
                recent_text += `${parseInt(detail.duration/60)}:${(detail.duration % 60).toString().padStart(2,'0')} | `
                /** Champion */
                recent_text += ko.CHAMPION[CHAMPION[game.champion]] + '\n';
                /** KDA */
                recent_text += `KDA: ${detail.kills}/${detail.deaths}/${detail.assists} (${parseInt(100 * detail.kills / detail.total_kills)}%) | `;
                /** CS */
                recent_text += `CS: ${detail.minions + detail.jungle}(${((detail.minions + detail.jungle) / (detail.duration / 60)).toFixed(1)}) | `;
                /** Gold */
                recent_text += "Gold: " + detail.gold + "\n```";
            }

            embed.addField('최근 전적', recent_text).setTimestamp().setFooter('Data from LoLog.me', 'https://lolog.me/favicon/favicon-16x16.png');
        return embed

    } catch (err) {
        /** Fail to get Data */
        if(err === 404) throw `"${summoner}" 소환사를 찾을 수 없습니다.`
        throw "검색 실패";
    }
}