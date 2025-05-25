import { Logger } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v5 as uuidv5 } from 'uuid';

// const MY_NAMESPACE = '1b671a64-40d5-491e-99b0-da01ff1f3341';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class BroadcastGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {

  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(BroadcastGateway.name);
  private availableDevices: Map<string, Socket> = new Map(); // Map deviceId -> socket
  private deviceClientMap: Map<string, string> = new Map(); // Map deviceId -> clientId

  afterInit() {
    this.logger.log('Initialized websocket');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);

    // Clean up availability list if device disconnects
    this.availableDevices.forEach((socket, id) => {
      if (socket.id === client.id) {
        this.availableDevices.delete(id);
      }
    });

    // Clean up room mapping if device or client disconnects
    this.deviceClientMap.forEach((clientId, deviceId) => {
      if (clientId === client.id || deviceId === client.id) {
        this.deviceClientMap.delete(deviceId);
        const deviceSocket = this.server.sockets.sockets.get(deviceId);
        if (deviceSocket) this.availableDevices.set(deviceId, deviceSocket); // make available again
      }
    });
  }

  @SubscribeMessage('add-to-devices')
  handleAddToDevices(client: Socket) {
    this.logger.log(`Device available: ${client.id}`);
    this.availableDevices.set(client.id, client);
    this.server.emit('available-devices', Array.from(this.availableDevices.keys()));
  }

  @SubscribeMessage('request-devices')
  handleRequestDevices(client: Socket) {
    const deviceIds = Array.from(this.availableDevices.keys());
    client.emit('available-devices', deviceIds);
  }

  @SubscribeMessage('connect-to-device')
  handleConnectToDevice(@ConnectedSocket() client: Socket, @MessageBody() deviceId: string) {
    const deviceSocket = this.availableDevices.get(deviceId);
    if (!deviceSocket) {
      this.logger.log(`connection-failed: Device ${deviceId} is not available`)
      client.emit('connection-failed', `Device ${deviceId} is not available`);
      return;
    }
    if (!client) {
      this.logger.log(`connection-failed:  client  ${client} is not available`)
      deviceSocket.emit('connection-failed', ` client ${client} is not available`);
      return;
    }
    deviceSocket.emit('connected', `connected to  ${deviceId}`);
    client.emit('connected', `connnected to  ${client.id}`);
    this.logger.log(`${client.id} connected to ${deviceId}`)

    this.deviceClientMap.set(deviceId, client.id);

    // device now not discoverable
    this.availableDevices.delete(deviceId);

  }
  @SubscribeMessage("send-to-connected-device")
  sendToclient(@ConnectedSocket() device: Socket, @MessageBody() command: any) {
    const clientId = this.deviceClientMap.get(device.id)

    let deviceId: string | null = null;
    this.deviceClientMap.forEach((v, k) => {
      if (v === device.id) deviceId = k;
    });

    if (!(clientId || deviceId)) {
      device.emit('connection-failed', `Device is not connected please connect`);
      return
    }

    if (clientId) {

      const clientSocket = this.server.sockets.sockets.get(clientId);
      if (clientSocket)
        clientSocket.emit("message-from-connected-device", command) // i want to send to clientId
      return

    }
    if (deviceId) {

      const deviceSocket = this.server.sockets.sockets.get(deviceId);
      if (deviceSocket)
        deviceSocket.emit("message-from-connected-device", command) // i want to send to deviceId
      return

    }
  }

  sendCommand(deviceId: string, command: any) {

    const pairedClientId = this.deviceClientMap.get(deviceId)

    let pairedDeviceId: string | null = null;
    this.deviceClientMap.forEach((v, k) => {
      if (v === deviceId) pairedDeviceId = k;
    });

    if (!(pairedClientId || pairedDeviceId)) {
      const device = this.server.sockets.sockets.get(deviceId);
      if (device)
        device.emit('connection-failed', `Device is not connected please connect`);
      this.logger.error("connection failed")
      this.logger.warn("Device is not connected please connect")
      return
    }

    if (pairedClientId) {

      const clientSocket = this.server.sockets.sockets.get(pairedClientId);
      if (clientSocket) {
        clientSocket.emit("message-from-connected-device", command) // i want to send to clientId
        this.logger.debug(" client: message-from-connected-device", command)
      }
      return

    }
    if (pairedDeviceId) {

      const deviceSocket = this.server.sockets.sockets.get(pairedDeviceId);
      if (deviceSocket)
        deviceSocket.emit("message-from-connected-device", command) // i want to send to deviceId
      this.logger.debug(" device: message-from-connected-device", command)
      return

    }
  }
  @SubscribeMessage('disconnect-from-device')
  handleDisconnectFromDevice(@ConnectedSocket() client: Socket, @MessageBody() deviceId: string) {
    const pairedClientId = this.deviceClientMap.get(deviceId);
    if (pairedClientId && (pairedClientId === client.id)) {

      const deviceSocket = this.server.sockets.sockets.get(deviceId);
      if (deviceSocket) {
        this.availableDevices.set(deviceId, deviceSocket); // make device available again
      }

      this.deviceClientMap.delete(deviceId);
    }
  }
}

