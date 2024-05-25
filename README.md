# Simple Redis-like Server in Node.js

## Overview

This project implements a simple Redis-like server in Node.js using the `net` module. The server can handle basic Redis commands such as `PING`, `ECHO`, `SET`, `GET`, `INFO`, `REPLCONF`, and `PSYNC`. It also supports setting keys with an expiration time.

## Features

- **PING**: Responds with `+PONG`.
- **ECHO**: Echoes the input message.
- **SET**: Sets a key with an optional expiration time.
- **GET**: Retrieves the value of a key, considering expiration if set.
- **INFO**: Provides server information, specifically related to replication.
- **REPLCONF**: Acknowledges replication configuration.
- **PSYNC**: Handles partial resynchronization for replication.

## Usage

### Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/yourusername/simple-redis-server.git
    cd simple-redis-server
    ```

2. Install dependencies (if any):
    ```sh
    npm install
    ```

### Running the Server

You can start the server with default or custom configurations.

- **Default Port (6379) and Master Mode:**
    ```sh
    node server.js
    ```

- **Custom Port:**
    ```sh
    node server.js --port <custom_port>
    ```

- **Replica Mode:**
    ```sh
    node server.js --replicaof <master_ip> --port <custom_port>
    ```

### Command Examples

- **PING:**
    ```sh
    $ redis-cli -p 6379 PING
    +PONG
    ```

- **ECHO:**
    ```sh
    $ redis-cli -p 6379 ECHO "Hello, World!"
    "Hello, World!"
    ```

- **SET and GET without Expiration:**
    ```sh
    $ redis-cli -p 6379 SET mykey "myvalue"
    +OK
    $ redis-cli -p 6379 GET mykey
    "myvalue"
    ```

- **SET and GET with Expiration:**
    ```sh
    $ redis-cli -p 6379 SET mykey "myvalue" PX 10000
    +OK
    $ redis-cli -p 6379 GET mykey
    "myvalue" (if within 10 seconds) or "$-1\r\n" (if after 10 seconds)
    ```

- **INFO:**
    ```sh
    $ redis-cli -p 6379 INFO
    # Replication
    role:master
    master_replid:8371b4fb1155b71f4a04d3e1bc3e18c4a990aeeb
    master_repl_offset:0
    ```

## Code Explanation

The server is implemented in a single Node.js script using the `net` module to handle TCP connections. Here's a brief overview of the main parts of the code:

- **Argument Parsing:**
    ```javascript
    const args = process.argv.slice(2);
    const portIndex = args.indexOf("--port");
    const serverPort = portIndex != -1 ? args[portIndex + 1] : 6379;
    const serverType = args.indexOf("--replicaof") != -1 ? "slave" : "master";
    ```

- **Server Creation and Event Handling:**
    ```javascript
    const server = net.createServer((connection) => {
        const keyValuePairs = {};
        const expValuePairs = {};

        connection.on('data', (data) => {
            const input = Buffer.from(data).toString().toUpperCase().split("\r\n");

            // Handle different commands here
        });

        connection.on('connect', () => {
            console.log("A client connected...");
        });

        connection.on('close', () => {
            console.log("A client disconnected...");
        });
    });

    server.listen(serverPort, '127.0.0.1', () => {
        console.log('Server is listening on port: ', serverPort);
    });
    ```

- **Command Handling:**
    ```javascript
    if (input.includes("PING")) {
        connection.write("+PONG\r\n");
    } else if (input.includes("ECHO")) {
        connection.write(`${input[3]}\r\n${input[4]}\r\n`);
    } else if (input.includes("SET")) {
        // Handle SET command
    } else if (input.includes("GET")) {
        // Handle GET command
    } else if (input.includes("INFO")) {
        const heading = "# Replication";
        const serverKeyValuePair = `role:${serverType}`;
        const infoString = `${heading}\r\n${serverKeyValuePair}\r\n${mid}\r\n${mOff}\r\n`;
        const infoStringLength = infoString.replace("\r\n", "").length;
        connection.write(`$${infoStringLength}\r\n${infoString}`);
    } else if (input.includes("REPLCONF")) {
        connection.write("+OK\r\n");
    } else if (input.includes("PSYNC")) {
        connection.write(`+FULLRESYNC ${mid.split(":")[1]} ${mOff.split(":")[1]}\r\n`);
        const bufferRDB = Buffer.from(hardcodeRDB, 'base64');
        const res = Buffer.concat([Buffer.from(`$${bufferRDB.length}\r\n`), bufferRDB]);
        connection.write(res);
    }
    ```

## Contributing

Feel free to fork the project, submit pull requests, and report issues. Contributions are welcome!

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

**Note:** This implementation is a simplified version of a Redis server and is intended for educational purposes. It may not be suitable for production use.