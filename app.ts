import * as WebSocket from "ws";
import {v4 as uuidv4} from 'uuid';
import {Message} from "./Message";

const port = 3000;

const clients = {};

const wss = new WebSocket.Server({port});
wss.on('connection', function connection(ws: WebSocket) {
    console.log("Connection established.");
    const uuid = uuidv4();

    ws.send(JSON.stringify(new Message("INIT", {uuid})));

    clients[uuid] = ws;

    ws.on('message', (messageRaw: string) => {
        console.log("Message received.");
        console.log("Message: " + messageRaw);

        const message: Message = JSON.parse(messageRaw);

        message.from = getUuidByClient(ws);

        if (message.to) {
            if (clients[message.to]){
                clients[message.to].send(JSON.stringify(message));
            }
        } else {
            for (let uuid in clients) {
                if (clients[uuid] !== ws) {
                    clients[uuid].send(JSON.stringify(message));
                }
            }
        }
    });

    ws.on('close', () => {
        delete clients[uuid];
    })
});

function getUuidByClient(client: WebSocket): string {
    for (let uuid in clients) {
        if (clients[uuid] == client) return uuid
    }

    return null;
}
