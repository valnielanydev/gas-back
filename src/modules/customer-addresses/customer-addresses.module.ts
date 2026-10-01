import { Module } from '@nestjs/common';
import { CustomerAddressesService } from './customer-addresses.service';
import { CustomerAddressesController } from './customer-addresses.controller';
import { MongooseModule } from '@nestjs/mongoose';
import {
  CustomerAddresses,
  CustomerAddressesSchema,
} from './schemas/customer-addresses.schema';
import { CustomerAdressesRepository } from './customer-addresses.repository';
import { GeocodingModule } from '../geocoding/geocoding.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CustomerAddresses.name, schema: CustomerAddressesSchema },
    ]),
    GeocodingModule,
  ],
  controllers: [CustomerAddressesController],
  providers: [CustomerAddressesService, CustomerAdressesRepository],
})
export class CustomerAddressesModule {}
