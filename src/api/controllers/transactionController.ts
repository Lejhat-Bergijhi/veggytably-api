import { Request, Response } from "express";
import { getWalletByUserId } from "../services/walletService";
import { transactionService } from "../services/transactionService";

import { socketManager } from "../../config/socket";
import { driverService } from "../services/driverService";

async function getWallet(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;

  const wallet = await getWalletByUserId(userId);

  res.status(200).json({
    data: {
      wallet: wallet,
    },
  });
}

async function getTransactions(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { role } = payload;

  const transaction = await transactionService.getTransactionsByUserId(
    userId,
    role
  );

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

async function getTransactionsByMerchantId(req: Request, res: Response) {
  const { merchantId } = req.params;

  const transaction = await transactionService.getTransactionsByMerchantId(
    merchantId
  );

  console.log(merchantId);

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

async function postTransaction(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { cartId, merchantId, paymentMethod, customerAddress } = req.body;

  const result = await transactionService.createTransaction(
    userId,
    cartId,
    merchantId,
    paymentMethod,
    customerAddress
  );

  const {
    transaction,
    quantity,
    totalPrice,
    customerAddress: cusAdr,
    merchantAddress: merAdr,
  } = result;

  // broadcast to selected merchant
  const merchantNamespace = socketManager.getMerchantNamespace();
  merchantNamespace.to(merchantId).emit("transaction", result);

  // find a driver that is online and near the merchant
  const driver = driverService.getClosestDriver();
  // broadcast to driver
  // get driver location then broadcast to driver
  driverService.broadcastToDriver(driver, "location", {
    transactionId: transaction.id,
    merchantAddress: merAdr,
    customerAddress: cusAdr,
  });
  // server will be listening for "location" event from driver
  // then server will send the route to the driver
  // logic for the callback is in driverService.ts and socket.ts

  //  customer
  //  customer needs to listen for the driver that accepts the order
  /**
   *      The delivery partner's data, such as name and the plate number
   *      A map that shows the restaurant's and the customer's locations
   *      The estimated delivery time
   *
   *      The delivery partner that has finished the delivery can then press the "Finished" button on their side to state that the order has been completed.
   */

  // calculate distance between merchant and customer
  const { merchantToCustomer } =
    await transactionService.getMerchant2CustomerRoute(
      { latitude: merAdr.latitude, longitude: merAdr.longitude },
      { latitude: cusAdr.latitude, longitude: cusAdr.longitude }
    );

  const merchant = transaction.merchant;

  res.status(200).json({
    data: {
      transactionId: transaction.id,
      status: transaction.status,
      merchantAddress: merAdr,
      customerAddress: cusAdr,
      estimatedDeliveryTime: merchantToCustomer.duration + 10 * 60, // seconds
      merchant: merchant,
      cart: transaction.cart,
      totalPrice: totalPrice,
      deliveryFee: 10000,
    },
  });
}

// driver accepts the order
async function addDriverTransaction(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { transactionId } = req.params;

  const transaction = await transactionService.acceptOrder(
    userId,
    transactionId
  );

  // broadcast to customer
  const customerNamespace = socketManager.getCustomerNamespace();
  customerNamespace
    .to(transaction.customerId)
    .to(transactionId)
    .emit("driver-found", {
      driverId: userId,
      driverName: transaction.driver.user.username,
      driverPlateNumber: transaction.driver.licensePlate,
    });

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

// driver updates the status of the order
async function updateTransactionStatus(req: Request, res: Response) {
  const payload = res.locals.user;
  const { userId } = payload;
  const { transactionId } = req.params;
  const { status } = req.body;

  const transaction = await transactionService.updateTransactionStatus(
    userId,
    transactionId,
    status
  );

  // broadcast to customer
  const customerNamespace = socketManager.getCustomerNamespace();
  customerNamespace.to(transaction.id).emit("status-update", {
    transactionId: transactionId,
    status: status,
  });

  res.status(200).json({
    data: {
      transaction: transaction,
    },
  });
}

export default {
  getWallet,
  getTransactions,
  getTransactionsByMerchantId,
  postTransaction,
  addDriverTransaction,
  updateTransactionStatus,
};
