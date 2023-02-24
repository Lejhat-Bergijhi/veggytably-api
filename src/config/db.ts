import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// connect db
export async function connectDB() {
  try {
    await prisma.$connect();
    console.log("Database connected.");
  } catch (error) {
    console.error(error);
    disconnectDB();
    process.exit(1);
  }
}

const disconnectDB = async () => {
  try {
    await prisma.$disconnect();
    console.log("Database disconnected.");
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
