const { spawn } = require("child_process");
const fetch = require("node-fetch");
const fs = require("fs");
const config = require("./config.json");
const https = require("https");
const yt2009utils = require("./yt2009utils");

if (!fs.existsSync("./logs/")) {
    fs.mkdirSync("./logs/");
}
console.log("logs will be saved to /back/logs/");

if (!fs.existsSync("./androiddata.json")) {
    const vids = [
        "evJ6gX1lp2o", "dQw4w9WgXcQ", "jNQXAC9IVRw",
        "yQwPhCI_qO0", "ts2a9cW4nLY"
    ];
    let rv = vids[Math.floor(Math.random() * vids.length)];
    fetch("https://www.youtube.com/youtubei/v1/player?prettyPrint=false", {
        "credentials": "include",
        "headers": {
            "Accept": "*/*",
            "Accept-Language": "pl,en-US;q=0.7,en;q=0.3",
            "Content-Type": "application/json",
            "x-goog-authuser": "0",
            "x-origin": "https://www.youtube.com/",
            "user-agent": "com.google.android.youtube/20.51.39 (Linux; U; Android 14) gzip",
            "cookie": require("./yt2009constants.json").headers.cookie
        },
        "agent": yt2009utils.createFetchAgent(),
        "referrer": "https://www.youtube.com/watch?v=" + rv,
        "body": JSON.stringify({
            "context": {
                "client": {
                    "hl": "en",
                    "clientName": "ANDROID",
                    "clientVersion": "20.51",
                    "mainAppWebInfo": {
                        "graftUrl": "/watch?v=" + rv
                    }
                }
            },
            "videoId": rv
        }),
        "method": "POST",
        "mode": "cors"
    }).then(r => {
        r.json().then(r => {
            if (r.playabilityStatus && r.playabilityStatus.status !== "OK"
                && r.playabilityStatus.reason
                && r.playabilityStatus.reason.includes("Sign in to confirm")) {
                console.log(`
=====================

you might face trouble with video
playback.

run backend.js outside of
backend_wrap for more info.

=====================

`);
            }
        });
    });
}

// merged fix: run backend.js in foreground so Koyeb sees it
function start_yt2009() {
    console.log(`yt2009 start at ${new Date().toLocaleString()}`);

    const yt2009 = spawn("node", ["backend.js"], {
        cwd: __dirname,
        stdio: "inherit"
    });

    const logFile = fs.createWriteStream("./logs/" + Date.now() + ".txt");
    yt2009.stdout?.pipe(logFile);
    yt2009.stderr?.pipe(logFile);

    yt2009.on("exit", (code) => {
        console.log(`backend.js exited with code ${code}`);
        process.exit(code); // let container die so Koyeb restarts it
    });
}

start_yt2009();
