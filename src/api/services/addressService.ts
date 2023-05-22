import { Address, PrismaClient } from "@prisma/client";
import { Ors } from "../utils/ors";

class AdressService {
  private prisma: PrismaClient;
  private ors: Ors;
  public defaultAddress: Address;

  constructor() {
    this.prisma = new PrismaClient();
    this.ors = new Ors();
  }

  public async createAddress(input: {
    coordinates: {
      latitude: number;
      longitude: number;
    } | null;
    address: string | null;
  }): Promise<Address> {
    const { coordinates, address } = input;
    if (!coordinates && !address) {
      throw new Error("coordinates or address is required.");
    }
    if (coordinates && address) {
      throw new Error("coordinates and address cannot be used together.");
    }

    if (coordinates) {
      // reverse geocode
      const { latitude, longitude } = coordinates;

      const data = await this.ors.reverseGeocode(longitude, latitude);

      const coors = data.features[0].geometry.coordinates; // [longitude, latitude]
      const [lon, lat] = coors;

      const { country, name, region, county } = data.features[0].properties;
      const address = await this.prisma.address.create({
        data: {
          address: `${name}, ${county}, ${region}, ${country}`,
          latitude: lat,
          longitude: lon,
        },
      });
      return address;
    }

    if (address) {
      // geocode
      const data = await this.ors.searchGeocode(address);

      const coors = data.features[0].geometry.coordinates;

      const [longitude, latitude] = coors; // [longitude, latitude

      const adr = await this.prisma.address.create({
        data: {
          address: address,
          latitude: latitude,
          longitude: longitude,
        },
      });
      return adr;
    }
  }

  public addressToCoordinates(address: Address) {
    const { latitude, longitude } = address;
    return { latitude, longitude };
  }

  async createDefaultAddress() {
    const address = await this.createAddress({
      // 110.3761053,-7.7674489
      coordinates: {
        latitude: -7.7674489,
        longitude: 110.3761053,
      },
      address: null,
    });
    this.defaultAddress = address;
  }
}

export const addressService = new AdressService();
