import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../shared/database/database.service';
import { CreateTourDto, UpdateTourDto, TourStatus } from '../../shared/types';

@Injectable()
export class ToursService {
  constructor(private prisma: DatabaseService) {}

  async create(createTourDto: CreateTourDto) {
    const tour = await this.prisma.tour.create({
      data: {
        destination: createTourDto.title,
        description: createTourDto.description,
        detail: createTourDto.description || '',
        price: createTourDto.price,
        duration: createTourDto.duration,
        maxCapacity: createTourDto.maxCapacity,
        imageUrl: createTourDto.imageUrl ? [createTourDto.imageUrl] : [],
        startDate: createTourDto.startDate,
        endDate: createTourDto.endDate,
        status: TourStatus.DRAFT,
      },
    });

    return tour;
  }

  async findAll() {
    return this.prisma.tour.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findActive() {
    return this.prisma.tour.findMany({
      where: { status: TourStatus.ACTIVE },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tour = await this.prisma.tour.findUnique({
      where: { id },
    });

    if (!tour) {
      throw new NotFoundException('Tour not found');
    }

    return tour;
  }

  async update(id: string, updateTourDto: UpdateTourDto) {
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
    });

    if (!existingTour) {
      throw new NotFoundException('Tour not found');
    }

    const updateData: any = {};
    if (updateTourDto.title) updateData.destination = updateTourDto.title;
    if (updateTourDto.description) updateData.description = updateTourDto.description;
    if (updateTourDto.price) updateData.price = updateTourDto.price;
    if (updateTourDto.duration) updateData.duration = updateTourDto.duration;
    if (updateTourDto.maxCapacity) updateData.maxCapacity = updateTourDto.maxCapacity;
    if (updateTourDto.imageUrl) updateData.imageUrl = [updateTourDto.imageUrl];
    if (updateTourDto.startDate) updateData.startDate = updateTourDto.startDate;
    if (updateTourDto.endDate) updateData.endDate = updateTourDto.endDate;

    return this.prisma.tour.update({
      where: { id },
      data: updateData,
    });
  }

  async updateStatus(id: string, status: TourStatus) {
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
    });

    if (!existingTour) {
      throw new NotFoundException('Tour not found');
    }

    return this.prisma.tour.update({
      where: { id },
      data: { status },
    });
  }

  async remove(id: string) {
    const existingTour = await this.prisma.tour.findUnique({
      where: { id },
    });

    if (!existingTour) {
      throw new NotFoundException('Tour not found');
    }

    await this.prisma.tour.delete({
      where: { id },
    });

    return { message: 'Tour deleted successfully' };
  }
} 