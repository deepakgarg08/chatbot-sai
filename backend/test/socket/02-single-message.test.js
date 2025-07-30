import { expect } from "chai";
import { io as Client } from "socket.io-client";
import jsonrpc from "jsonrpc-lite";
import { startServer, stopServer, httpServerAddr } from "./setup.js";

describe("Single message send and receive", function () {
  before(async function () {
    await startServer();
  });

  after(async function () {
    await stopServer();
  });

  it("should send a message and broadcast to another client", function () {
    this.timeout(10000);

    return new Promise((resolve, reject) => {
      const sender = new Client(`http://localhost:${httpServerAddr.port}`);
      const receiver = new Client(`http://localhost:${httpServerAddr.port}`);

      let messageReceived = false;
      let ackReceived = false;

      receiver.on("connect", () => {
        receiver.on("rpc", (msg) => {
          try {
            const parsed = jsonrpc.parseObject(msg);
            if (
              parsed.type === "notification" &&
              parsed.payload.method === "chatMessage"
            ) {
              expect(parsed.payload.params).to.include({
                user: "tester",
                text: "Hello, world!",
              });
              messageReceived = true;
              checkDone();
            }
          } catch (err) {
            sender.disconnect();
            receiver.disconnect();
            reject(err);
          }
        });
      });

      sender.on("connect", () => {
        const registerReq = jsonrpc.request(10, "registerUser", {
          username: "tester",
        });
        sender.emit("rpc", registerReq);

        sender.once("rpc", (msg) => {
          try {
            const rparsed = jsonrpc.parseObject(msg);
            if (rparsed.type === "success" && rparsed.payload.id === 10) {
              const sendMsgReq = jsonrpc.request(11, "sendMessage", {
                user: "tester",
                text: "Hello, world!",
              });
              sender.emit("rpc", sendMsgReq);

              sender.on("rpc", (rmsg) => {
                try {
                  const rparsed2 = jsonrpc.parseObject(rmsg);
                  if (
                    rparsed2.type === "success" &&
                    rparsed2.payload.id === 11
                  ) {
                    expect(rparsed2.payload.result).to.have.property("delivered", true);
                    ackReceived = true;
                    checkDone();
                  }
                } catch (err) {
                  sender.disconnect();
                  receiver.disconnect();
                  reject(err);
                }
              });
            } else {
              reject(new Error("Failed to register user before sending message"));
            }
          } catch (err) {
            reject(err);
          }
        });
      });

      function checkDone() {
        if (messageReceived && ackReceived) {
          sender.disconnect();
          receiver.disconnect();
          resolve();
        }
      }

      sender.on("error", (err) => {
        sender.disconnect();
        receiver.disconnect();
        reject(err);
      });

      receiver.on("error", (err) => {
        sender.disconnect();
        receiver.disconnect();
        reject(err);
      });
    });
  });

});
