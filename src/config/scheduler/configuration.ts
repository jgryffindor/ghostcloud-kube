import { registerAs } from "@nestjs/config";
import * as process from "process";

export default registerAs("scheduler", () => ({
  cron: process.env.SCHEDULER_CRON,
  seconds: process.env.SCHEDULER_SECONDS,
}));
