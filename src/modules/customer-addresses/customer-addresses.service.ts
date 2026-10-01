import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { CustomerAdressesRepository } from './customer-addresses.repository';
import { Connection, Types } from 'mongoose';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';
import { InjectConnection } from '@nestjs/mongoose';
import { GeocodingService } from '../geocoding/geocoding.service';
import { Location } from './interfaces/location.interface';
import { GeoPoint } from '../../common/schemas/geo-point.schema';

@Injectable()
export class CustomerAddressesService {
  constructor(
    private readonly customerAddressesRepository: CustomerAdressesRepository,
    private readonly geocodingService: GeocodingService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async create(userId: Types.ObjectId, data: CreateCustomerAddressDto) {
    const location = data.location ?? (await this.resolveLocation(data));

    if (!data.isDefault) {
      const hasAddresses =
        await this.customerAddressesRepository.existsByUserId(userId);

      return this.customerAddressesRepository.create(userId, {
        ...data,
        isDefault: !hasAddresses,
        location,
      });
    }

    const session = await this.connection.startSession();

    try {
      return await session.withTransaction(async () => {
        await this.customerAddressesRepository.unsetDefault(userId, session);
        return this.customerAddressesRepository.create(
          userId,
          { ...data, location },
          session,
        );
      });
    } finally {
      await session.endSession();
    }
  }

  findAllByUserId(userId: Types.ObjectId) {
    return this.customerAddressesRepository.findAllByUserId(userId);
  }

  async findOne(userId: Types.ObjectId, id: Types.ObjectId) {
    const address = await this.customerAddressesRepository.findOne(userId, id);

    if (!address) throw new NotFoundException('Address not found');

    return address;
  }

  async update(
    userId: Types.ObjectId,
    id: Types.ObjectId,
    data: UpdateCustomerAddressDto,
  ) {
    const currentAddress = await this.findOne(userId, id);

    const merged = {
      postalCode: data.postalCode ?? currentAddress.postalCode,
      street: data.street ?? currentAddress.street,
      city: data.city ?? currentAddress.city,
      state: data.state ?? currentAddress.state,
    };

    const addressChanged =
      merged.postalCode !== currentAddress.postalCode ||
      merged.street !== currentAddress.street ||
      merged.city !== currentAddress.city ||
      merged.state !== currentAddress.state;

    const location = data.location
      ? data.location
      : addressChanged
        ? await this.resolveLocation(merged)
        : undefined;

    if (!data.isDefault) {
      const address = await this.customerAddressesRepository.update(
        userId,
        id,
        { ...data, ...(location && { location }) },
      );

      if (!address) throw new NotFoundException('Address not found');

      return address;
    }

    const session = await this.connection.startSession();

    try {
      const result = await session.withTransaction(async () => {
        await this.customerAddressesRepository.unsetDefault(
          userId,
          session,
          id,
        );

        const address = await this.customerAddressesRepository.update(
          userId,
          id,
          { ...data, ...(location && { location }) },
          session,
        );

        if (!address) throw new NotFoundException('Address not found');

        return address;
      });

      return result;
    } finally {
      await session.endSession();
    }
  }

  async remove(userId: Types.ObjectId, id: Types.ObjectId) {
    const address = await this.customerAddressesRepository.delete(userId, id);

    if (!address) throw new NotFoundException('Address not found');
  }

  private async resolveLocation(data: Location): Promise<GeoPoint> {
    const locationResolved = await this.geocodingService.geocode({
      postalCode: data.postalCode,
      street: data.street,
      city: data.city,
      state: data.state,
    });

    if (locationResolved === null)
      throw new UnprocessableEntityException(
        'Confira se o endereço está correto',
      );

    return { type: 'Point', coordinates: locationResolved };
  }
}
