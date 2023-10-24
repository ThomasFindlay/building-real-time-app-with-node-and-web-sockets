import Fastify from "fastify";
import fastifyWebSockets from "@fastify/websocket";
import cors from "@fastify/cors";

const fastify = Fastify({
  logger: true,
});

/**
 * Register cors to allow all connections. Note that in production environments you should
 * narrow down domains that should be able to access your server.
 */
fastify.register(cors);

/**
 * Register the Fastify Web Sockets plugin
 */
fastify.register(fastifyWebSockets);

const usersOnline = new Set();
/**
 * Register a new handler to listen for Web Socket messages
 */
fastify.register(async function (fastify) {
  fastify.get(
    "/online-status",
    {
      websocket: true,
    },
    (connection, req) => {
      connection.socket.on("message", msg => {
        const data = JSON.parse(msg.toString());
        if (
          typeof data === "object" &&
          "onlineStatus" in data &&
          "userId" in data
        ) {
          // If the user is not registered as logged in yet, we add this user's id
          if (data.onlineStatus && !usersOnline.has(data.userId)) {
            usersOnline.add(data.userId);
          } else if (!data.onlineStatus && usersOnline.has(data.userId)) {
            usersOnline.delete(data.userId);
          }

          /**
           * Broadcast the change in online users status to all subscribers.
           */
          fastify.websocketServer.clients.forEach(client => {
            if (client.readyState === 1) {
              client.send(
                JSON.stringify({
                  onlineUsersCount: usersOnline.size,
                })
              );
            }
          });
        }
      });
    }
  );
});

fastify.get("/", async (request, reply) => {
  return { hello: "world" };
});

try {
  await fastify.listen({ port: 3000 });
  fastify.log.info(`Server is running on port ${3000}`);
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
