import request from "supertest";
import { app, server } from "../src/app.js";

describe("Basic HTTP Server", function () {
  after(function (done) {
    if (server.listening) {
      server.close(done);
    } else {
      done();
    }
  });


  // it("GET / should return status 200 and correct message", async function () {
  //   await request(app)
  //     .get("/")
  //     .expect(200)
  //     .expect("Real-time Chat Backend is running");
  // });
});
