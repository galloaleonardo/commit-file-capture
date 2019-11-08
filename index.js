var fs = require('fs');
var request = require('request');
var path = 'your\\path\\here';
const gitCmd = require('simple-git');
const oneHour = 3600000;
var processing = false;

function analysePath() {
    if (!processing) {
            processing = true;
            jsonFile = fs.readFileSync('data/MigratedUnits.json')
            migratedUnits = JSON.parse(jsonFile);

            for (i = 0; i < migratedUnits.length; i++) {

                unitPath = migratedUnits[i].filePath;
                unitLastUpdate = migratedUnits[i].lastUpdate;

                stats = fs.statSync(unitPath);
                timeChanged = stats.mtime.toISOString().replace(/T/, ' ').replace(/\..+/, '');

                if (timeChanged != unitLastUpdate) {
                    sendSlackNotification(unitPath, timeChanged);
                }
            }
        processing = false;
    }
};

function sendSlackNotification(unitPath, timeChanged) {
    const url = 'https://hooks.slack.com/services/YOUR/SLACK/YOUR_TOKEN_HERE';
    const text = `*Arquivo modificado identificado:* ${unitPath}.\n*Data/Hora da alteração:* ${timeChanged}.`;

    request.post({
            headers: {
                'Content-type': 'application/json'
            },
            url,
            form: {
                payload: JSON.stringify({
                    text
                })
            }
        },
    );
}

function startService() {
    gitCmd(path).checkout('.', function () {
        gitCmd(path).pull('origin', 'master', [], function () {
            analysePath()
        });            
    });
}

setInterval(startService, oneHour)