import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { JobsService } from "./jobs.service";
import { CreateJobDto, UpdateJobStatusDto } from "./dto/jobs.dto";
import { AutoDetectServiceDto } from "./dto/jobs-auto-detect.dto";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";

@ApiTags("jobs")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller("jobs")
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @ApiOperation({ summary: "Auto-detect service from description" })
  @Post("auto-detect")
  async autoDetectService(@Body() dto: AutoDetectServiceDto) {
    return this.jobsService.autoDetectService(dto.description);
  }

  @ApiOperation({ summary: "Create a new job request" })
  @Post()
  async createJob(@Req() req: any, @Body() dto: CreateJobDto) {
    return this.jobsService.createJob(req.user.sub, dto);
  }

  @ApiOperation({ summary: "List all jobs with filters and pagination" })
  @Get()
  async getJobs(
    @Query("status") status?: string,
    @Query("serviceId") serviceId?: string,
    @Query("clientId") clientId?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const pageNum = page ? Math.max(1, parseInt(page)) : 1;
    const pageSizeNum = pageSize
      ? Math.min(100, Math.max(1, parseInt(pageSize)))
      : 20;
    return this.jobsService.findAllJobs({
      status,
      serviceId,
      clientId,
      page: pageNum,
      pageSize: pageSizeNum,
    });
  }

  @ApiOperation({ summary: "Get my jobs (as client or artisan)" })
  @ApiQuery({ name: "status", required: false, type: String })
  @Get("my")
  async getMyJobs(@Req() req: any, @Query("status") status?: string) {
    return this.jobsService.findMyJobs(req.user.sub, req.user.role, status);
  }

  @ApiOperation({ summary: "Get details of a specific job" })
  @Get(":id")
  async getJobById(@Param("id") jobId: string) {
    return this.jobsService.findJobById(jobId);
  }

  @ApiOperation({ summary: "Update job status" })
  @Patch(":id/status")
  async updateJobStatus(
    @Param("id") jobId: string,
    @Req() req: any,
    @Body() dto: UpdateJobStatusDto,
  ) {
    return this.jobsService.updateJobStatus(jobId, req.user.sub, dto);
  }

  @ApiOperation({ summary: "Get AI recommendations for a job" })
  @Get(":id/matches")
  async getJobMatches(@Param("id") jobId: string) {
    return this.jobsService.getAiMatchesForJob(jobId);
  }
}
