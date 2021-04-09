import * as WebSocket from "ws";

class Client {
    uuid: string;
    socket: WebSocket;
    channel: string;

    constructor(uuid: string, socket: WebSocket) {
        this.uuid = uuid;
        this.socket = socket;
    }
}

export {Client};
