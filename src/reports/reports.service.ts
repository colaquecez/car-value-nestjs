import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateReportDto } from './dtos/create-report.dto';
import { Repository } from 'typeorm';
import { Report } from './Report.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { ApproveReportDto } from './dtos/approve-report.dto';
import { GetEstimateDto } from './dtos/get-estimate.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Report) private reportRepository: Repository<Report>,
  ) {}

  create(createReportDto: CreateReportDto, user: User) {
    const report = this.reportRepository.create(createReportDto);

    report.user = user;

    return this.reportRepository.save(report);
  }

  async changeApproval(id: string, approveReportDto: ApproveReportDto) {
    const report = await this.reportRepository.findOne({
      where: {
        id,
      },
    });

    if (!report) {
      throw new NotFoundException();
    }

    report.approved = approveReportDto.approved;

    return this.reportRepository.save(report);
  }

  async createEstimate(estimateDto: GetEstimateDto) {
    return this.reportRepository
      .createQueryBuilder()
      .select('AVG(price)', 'price')
      .where('make = :make', { make: estimateDto.make })
      .andWhere('model = :model', { model: estimateDto.model })
      .andWhere('lng - :lng BETWEEN -5 and 5', { lng: estimateDto.lng })
      .andWhere('lat - :lat BETWEEN -5 and 5', { lat: estimateDto.lat })
      .andWhere('year - :year BETWEEN -3 and 3', { year: estimateDto.year })
      .andWhere('approved IS TRUE')
      .orderBy('ABS(mileage - :mileage)', 'DESC')
      .setParameters({ mileage: estimateDto.mileage })
      .limit(3)
      .getRawOne();
  }
}
