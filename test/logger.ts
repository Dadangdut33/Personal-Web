// Purpose: Test logger is running and connected to logflare
// Usage: Run `tsx test/logger.ts` to test the logger
import { logger } from "@/lib/logger";

try {
  throw new Error("this is an object");
} catch (error) {
  logger.info(error, "hello test logger info. It's running!");
  logger.debug(error, "hello test logger debug. It's running!");
  logger.trace(error, "hello test logger trace. It's running!");
  logger.warn(error, "hello test logger warn. It's running!");
  logger.error(error, "hello test logger error. It's running!");
  logger.fatal(error, "hello test logger fatal. It's running!");

  logger.info("hello test logger info. It's running!");
  logger.debug("hello test logger debug. It's running!");
  logger.trace("hello test logger trace. It's running!");
  logger.warn("hello test logger warn. It's running!");
  logger.error("hello test logger error. It's running!");
  logger.fatal("hello test logger fatal. It's running!");
}
