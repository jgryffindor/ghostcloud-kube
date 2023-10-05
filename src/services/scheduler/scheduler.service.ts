import { Inject, Injectable, Logger } from "@nestjs/common";
import { CronJob } from "cron";
import { SchedulerRegistry } from "@nestjs/schedule";
import { NetworkService } from "src/network/network.service";
import { NetworkUpdater } from "./network/updater";
import { SchedulerConfigService } from "../../config/scheduler/configuration.service";

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);
  private done = true;

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private schedulerConfig: SchedulerConfigService,
    private network: NetworkService,
    private updater: NetworkUpdater,
  ) {
    const jobFn = () => this.run();

    if (schedulerConfig.cron !== undefined) {
      // Do not rerun the cron job if the previous one was done.
      const job = new CronJob(schedulerConfig.cron, jobFn);
      this.logger.log(`Cron scheduled: ${schedulerConfig.cron}`);
      this.schedulerRegistry.addCronJob("updateIngressResources", job);
      job.start();
    } else if (schedulerConfig.seconds !== undefined) {
      const interval = setInterval(jobFn, schedulerConfig.seconds * 1000);
      this.logger.log(`Interval scheduled: ${schedulerConfig.seconds}sec`);
      this.schedulerRegistry.addInterval("updateIngressResources", interval);
    } else {
      this.logger.log(`Scheduler disabled.`);
    }
  }

  run() {
    if (this.done) {
      this.done = false;
      this.logger.log("Starting new scheduler run...");
      try {
        this.updateIngressResources();
      } catch (err) {
        this.logger.error(`Error during update: ${err}`);
      }
      // On error, hope for the best next time.
      this.done = true;
    }
  }

  async updateIngressResources() {
    await this.updater.run(this.network);
  }
}
