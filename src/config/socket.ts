import { Namespace, Server } from "socket.io";
import http from "http";

class SocketManager {
  private io: Server;
  private merchantNamespace: Namespace;

  init(server: http.Server) {
    this.io = new Server(server);
    this.io.on("connection", (socket) => {
      console.log("a client has connected");
    });

    this.io.on("disconnect", (socket) => {
      console.log("a client has disconnected");
    });

    /**
     * Merchant namespace
     */
    this.merchantNamespace = this.io.of("/merchant");

    this.merchantNamespace.on("connection", (socket) => {
      console.log("a merchant has connected");

      socket.on("subscribe", (merchantId) => {
        console.log("merchant subscribed to " + merchantId);
        socket.join(merchantId);
      });

      socket.on("disconnect", () => {
        console.log("a merchant has disconnected");
      });
    });
  }

  public getIO() {
    return this.io;
  }

  public getMerchantNamespace() {
    return this.merchantNamespace;
  }
}

export const socketManager = new SocketManager();
