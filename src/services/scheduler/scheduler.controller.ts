import { Controller, Get, Logger } from "@nestjs/common";
import { ApiExcludeController, ApiResponse } from "@nestjs/swagger";
import { oneLine } from "common-tags";
import { SchedulerService } from "./scheduler.service";

// @ApiExcludeController()
@Controller("scheduler")
export class SchedulerController {
  private readonly logger = new Logger(SchedulerController.name);

  constructor(private readonly scheduler: SchedulerService) {}

  @Get("run")
  @ApiResponse({
    status: 200,
    description: oneLine`
      Run the scheduler manually. If the scheduler is already running,
      this does nothing.
    `,
  })
  async run(): Promise<""> {
    this.logger.debug("Scheduler run beginning...");
    this.scheduler.run();
    return "";
  }
}
