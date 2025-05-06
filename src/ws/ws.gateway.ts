import { Logger } from '@nestjs/common';
import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit } from '@nestjs/websockets';
import { Server, WebSocket } from 'ws';

@WebSocketGateway({
  path: "ws",
  cors: {
    origin: '*',
  },
})
export class BroadcastGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private clients: WebSocket[] = [];
  private readonly logger = new Logger(BroadcastGateway.name);

  afterInit() {
    this.logger.log("Initialized");
  }

  handleConnection(client: WebSocket) {
    this.logger.log("New client connected");
    this.clients.push(client);
  }

  handleDisconnect(client: WebSocket) {
    this.logger.log("client disconnected");
    this.clients = this.clients.filter(c => c !== client);
  }

  // Generic JSON sender
  private sendJson(client: WebSocket, payload: object) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(payload));
    }
  }

  // Broadcast JSON to all clients
  broadcast(message: any) {
    this.logger.log("sending to ", message, "to ", this.clients.length, " clients")
    this.clients.forEach(client => {
      this.sendJson(client, message);
    });
  }
}
