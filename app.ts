import * as WebSocket from "ws";
import {v4 as uuidv4} from 'uuid';
import {Message} from "./Message";
import {Client} from "./Client";

const port = 3000;

const clients = {};

const wss = new WebSocket.Server({port});
wss.on('connection', function connection(ws: WebSocket) {
    console.log("Connection established.");
    const uuid = uuidv4();

    ws.send(JSON.stringify(new Message("INIT", {uuid})));

    clients[uuid] = new Client(uuid, ws);

    ws.on('message', (messageRaw: string) => {
        console.log("Message received.");
        console.log("Message: " + messageRaw);

        const client = getClientBySocket(ws);

        if (client === null) {
            return;
        }

        const message: Message = JSON.parse(messageRaw);
        message.from = client.uuid;

        if (message.to) {
            if (message.to === "SERVER") {
                switch (message.type) {
                    case "JOIN":
                        client.channel = message.data;
                        client.socket.send(JSON.stringify(new Message("JOINED")));
                        break;
                    case "UUID":
                        client.uuid = message.data;
                        clients[client.uuid] = client;
                        delete clients[message.from];
                        client.socket.send(JSON.stringify(new Message("INIT", {uuid: client.uuid})));
                        break;
                }
            } else if (clients[message.to]) {
                clients[message.to].socket.send(JSON.stringify(message));
            }
        } else {
            for (let uuid in clients) {
                if (clients[uuid].channel === client.channel && clients[uuid] !== client) {
                    clients[uuid].socket.send(JSON.stringify(message));
                }
            }
        }
    });

    ws.on('close', () => {
        delete clients[uuid];
    })
});

function getClientBySocket(socket: WebSocket): Client {
    for (let uuid in clients) {
        if (clients[uuid].socket == socket) {
            return clients[uuid];
        }
    }

    return null;
}
