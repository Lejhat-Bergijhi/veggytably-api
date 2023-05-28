import { Namespace, Server } from "socket.io";
import http from "http";
import { driverService, DriverService } from "../api/services/driverService";
import { Address } from "@prisma/client";
import { addressService } from "../api/services/addressService";
import { transactionService } from "../api/services/transactionService";
import { ors } from "../api/utils/ors";

class SocketManager {
  private io: Server;
  private merchantNamespace: Namespace;
  private driverNamespace: Namespace;
  private driverService: DriverService;

  constructor() {
    this.driverService = driverService;
  }

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

    /**
     * Driver namespace
     */
    this.driverNamespace = this.io.of("/driver");

    this.driverNamespace.on("connection", (socket) => {
      console.log("a driver has connected");

      socket.on("subscribe", (userId) => {
        console.log("driver subscribed to " + userId);
        socket.join(userId);

        console.log(this.getRooms("/driver"));
      });

      socket.on("handshake", async (data) => {
        console.log("location received");
        console.log(data);

        const { userId, location, address, transactionId } = data;
        // TODO: validate data

        const merchantAddress = address.merchantAddress as Address;
        const customerAddress = address.customerAddress as Address;

        const routes = await driverService.getTransactionRoute(
          location,
          addressService.addressToCoordinates(merchantAddress),
          addressService.addressToCoordinates(customerAddress)
        );

        /** broadcast to drivers
         * information:
         * - location of merchant + customer  && (s)
         * - order list
         * - total fee that needs to be paid by the customer + payment choice
         */
        const transaction = await transactionService.getTransactionById(
          transactionId
        );

        const res = {
          routes: routes,
          merchantAddress: merchantAddress,
          customerAddress: customerAddress,
          orderList: transaction.cart.cartItem,
          paymentMethod: transaction.paymentMethod,
          totalPrice: transactionService.totalPriceByCartItems(
            transaction.cart.cartItem
          ),
          customerName: transaction.customer.user.username,
          // TODO: ongkos kirim
        };

        console.log(res);
        driverService.broadcastToDriver(userId, "newOrder", res);
      });

      socket.on("disconnect", () => {
        console.log("a driver has disconnected");
        console.log(this.getRooms("/driver"));
      });
    });
  }

  public getIO() {
    return this.io;
  }

  public getMerchantNamespace() {
    return this.merchantNamespace;
  }

  public getDriverNamespace() {
    return this.driverNamespace;
  }

  public async getSockets(namespace = "/") {
    const sockets = await this.io.in(namespace).fetchSockets();
    return sockets;
  }

  public getRooms(namespace = "/") {
    const roomsMap = this.io.of(namespace).adapter.rooms;

    const rooms = roomsMap.keys();

    return Array.from(rooms);
  }

  public broadcastToRoom(
    namespace: string,
    room: string,
    event: string,
    data: any
  ) {
    const namespaceObj = this.io.of(namespace);
    namespaceObj.to(room).emit(event, data);
  }
}

export const socketManager = new SocketManager();
