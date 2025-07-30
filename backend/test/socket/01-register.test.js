import { expect } from "chai";
import { io as Client } from "socket.io-client";
import jsonrpc from "jsonrpc-lite";
import { startServer, stopServer, httpServerAddr } from "./setup.js";

describe("User registration tests", function () {
  before(async function () {
    await startServer();
  });

  after(async function () {
    await stopServer();
  });

  it("should register a user successfully", function () {
    this.timeout(5000);

    return new Promise((resolve, reject) => {
      const socket = new Client(`http://localhost:${httpServerAddr.port}`);

      socket.on("connect", () => {
        const request = jsonrpc.request(1, "registerUser", { username: "testUser" });
        socket.emit("rpc", request);
      });

      socket.on("rpc", (msg) => {
        try {
          const parsed = jsonrpc.parseObject(msg);
          if (parsed.type === "success" && parsed.payload.id === 1) {
            expect(parsed.payload.result).to.have.property("registered", true);
            socket.disconnect();
            resolve();
          }
        } catch (err) {
          socket.disconnect();
          reject(err);
        }
      });

      socket.on("error", (err) => {
        socket.disconnect();
        reject(err);
      });
    });
  });
});
