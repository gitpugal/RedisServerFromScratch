const net = require('net');

const args = process.argv.slice(2);
const portIndex = args.indexOf("--port");
const serverPort = portIndex != -1 ? args[portIndex + 1] : 6379
const serverType = args.indexOf("--replicaof") != -1 ? "slave" : "master";
const hardcodeRDB = "UkVESVMwMDEx+glyZWRpcy12ZXIFNy4yLjD6CnJlZGlzLWJpdHPAQPoFY3RpbWXCbQi8ZfoIdXNlZC1tZW3CsMQQAPoIYW9mLWJhc2XAAP/wbjv+wP9aog=="


const server = net.createServer((connection) => {

    const keyValuePairs = {}
    const expValuePairs = {}
    connection.on('data', (data) => {
        const input = Buffer.from(data).toString().toUpperCase().split("\r\n");

        console.log(input);
        let streamLength = input.length;
        let mid = "master_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb";
        let mOff = "master_repl_offset:0";

        if (input.includes("PING")) {
            connection.write("+PONG\r\n");
        } else if (input.includes("ECHO")) {
            connection.write(`${input[3]}\r\n${input[4]}\r\n`);
        }
        else if (input.includes("SET")) {
            if (!input.includes("PX") && !input.includes("px") && !input.includes("pX") && !input.includes("Px")) {
                keyValuePairs[input[streamLength - 4]] = input[streamLength - 2];
                // console.log("SET without exp");
                // console.log(keyValuePairs)
            } else {
                // console.log("SET with exp")

                const time = input[streamLength - 2];
                expValuePairs[input[streamLength - 8]] = Date.now() + parseInt(time);
                keyValuePairs[input[streamLength - 8]] = input[streamLength - 6];
            }
            connection.write("+OK\r\n");
        }
        else if (input.includes("GET")) {
            // console.log(keyValuePairs)

            if (expValuePairs[input[streamLength - 2]]) {
                console.log("Expiry: ", expValuePairs[input[streamLength - 2]]);
                console.log("NOW: ", Date.now());
                console.log(keyValuePairs);
                console.log(expValuePairs);

                if (expValuePairs[input[streamLength - 2]] >= Date.now()) {
                    console.log("NOT EXPIRED")
                    connection.write(`$${keyValuePairs[input[streamLength - 2]].length}\r\n${keyValuePairs[input[streamLength - 2]]}\r\n`);
                } else {
                    console.log("EXPIRED")
                    delete keyValuePairs[input[streamLength - 2]];
                    delete expValuePairs[input[streamLength - 2]];
                    console.log(keyValuePairs);
                    console.log(expValuePairs);
                    connection.write("$-1\r\n")
                }
            } else {
                if (keyValuePairs[input[streamLength - 2]]) {
                    connection.write(`$${keyValuePairs[input[streamLength - 2]].length}\r\n${keyValuePairs[input[streamLength - 2]]}\r\n`);
                } else {
                    connection.write("$15\r\nENTRY NOT VALID\r\n");
                }
            }
        }
        else if (input.includes("INFO")) {
            const heading = "# Replication";
            const serverKeyValuePair = `role:${serverType}`;
            const infoString = `${heading}\r\n${serverKeyValuePair}\r\n${mid}\r\n${mOff}\r\n`;
            const infoStringLength = infoString.replace("\r\n", "").length;
            console.log(`$${infoStringLength}\r\n${infoString}`)
            connection.write(`$${infoStringLength}\r\n${infoString}`);
        }
        else if (input.includes("REPLCONF")) {
            connection.write("+OK\r\n")
        }
        else if (input.includes("PSYNC")) {
            connection.write(`+FULLRESYNC ${mid.split(":")[1]} ${mOff.split(":")[1]}\r\n`);
            const bufferRDB = Buffer.from(hardcodeRDB, 'base64')
            const res = Buffer.concat([Buffer.from(`$${bufferRDB.length}\r\n`), bufferRDB])
            connection.write(res);
        }
    });

    connection.on('connect', () => {
        console.log("An client connected...")
    })

    connection.on('close', () => {
        console.log("An client disconnected...")
    })
});

server.listen(serverPort, '127.0.0.1', () => {
    console.log('Server is listening on port: ', serverPort);
});
