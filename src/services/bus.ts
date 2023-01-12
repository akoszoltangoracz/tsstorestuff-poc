import { connect, NatsConnection } from "nats";

interface Bus {
  connection?: NatsConnection
};

export const bus: Bus = { connection: null };

export const connectBus = async (): Promise<void> => {
  bus.connection = await connect({ servers: process.env.NATS_URI });
  console.log('connected to bus');
};
