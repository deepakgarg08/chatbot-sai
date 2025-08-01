import { expect, afterEach, beforeAll } from "vitest";
import { cleanup } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { log } from "../config";

// extends Vitest's expect method with methods from react-testing-library
expect.extend(matchers);

// Setup logging for tests
beforeAll(() => {
  log.info("Test suite starting");
});

// runs a cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup();
  log.debug("Test cleanup completed");
});
