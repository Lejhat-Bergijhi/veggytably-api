import { Address, PrismaClient } from "@prisma/client";
import { BadRequestError } from "../utils/exceptions/BadRequestError";
import { socketManager } from "../../config/socket";
import { Ors, ors } from "../utils/ors";
import { addressService } from "./addressService";
import { transactionService } from "./transactionService";

class DriverService {
  private prisma: PrismaClient;
  private ors: Ors;
  constructor() {
    this.prisma = new PrismaClient();
    this.ors = ors;
  }

  public async getDriverByUserId(userId: string) {
    if (!userId) {
      throw new BadRequestError("userId is required.");
    }
    const driver = this.prisma.driver.findUnique({
      where: {
        userId: userId,
      },
    });
    return driver;
  }

  public getOnlineDrivers() {
    // get all socket rooms in driver namespace
    const rooms = socketManager.getRooms("/driver");
    // return the rooms except the first one (default room)
    const res = rooms.slice(1);
    return res;
  }

  public getClosestDriver() {
    // TODO: implement search, but select the first driver for now
    const drivers = this.getOnlineDrivers();
    if (drivers.length === 0) {
      throw new BadRequestError("No driver is online.");
    }
    const driver = drivers[0];
    return driver;
  }

  public broadcastToDriver(userId: string, event: string, data: any) {
    socketManager.broadcastToRoom("/driver", userId, event, data);
  }

  public async getTransactionRoute(
    driverLocation: { latitude: number; longitude: number },
    merchantLocation: { latitude: number; longitude: number },
    customerLocation: { latitude: number; longitude: number }
  ) {
    // all location { latitude: number, longitude: number }
    const driverToMerchant = await this.ors.getDirections(
      driverLocation,
      merchantLocation
    );

    const merchantToCustomer = await this.ors.getDirections(
      merchantLocation,
      customerLocation
    );

    const route = {
      driverToMerchant: driverToMerchant,
      merchantToCustomer: merchantToCustomer,
    };

    return route;
  }
}

export { DriverService };
export const driverService = new DriverService();
