import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  HttpCode,
} from '@nestjs/common';
import { CustomerAddressesService } from './customer-addresses.service';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { Types } from 'mongoose';
import { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import type { Request } from 'express';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';

@Controller('customer-addresses')
export class CustomerAddressesController {
  constructor(
    private readonly customerAddressesService: CustomerAddressesService,
  ) {}

  @Post()
  create(
    @Body() createCustomerAddressDto: CreateCustomerAddressDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;

    return this.customerAddressesService.create(
      new Types.ObjectId(user.sub),
      createCustomerAddressDto,
    );
  }

  @Get()
  findByUserId(@Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.customerAddressesService.findAllByUserId(
      new Types.ObjectId(user.sub),
    );
  }

  @Get(':id')
  findOne(@Param('id') id: Types.ObjectId, @Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.customerAddressesService.findOne(
      new Types.ObjectId(user.sub),
      id,
    );
  }

  @Patch(':id')
  update(
    @Param('id') id: Types.ObjectId,
    @Body() updateCustomerAddressDto: UpdateCustomerAddressDto,
    @Req() req: Request,
  ) {
    const user = req.user as JwtPayload;

    return this.customerAddressesService.update(
      new Types.ObjectId(user.sub),
      id,
      updateCustomerAddressDto,
    );
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: Types.ObjectId, @Req() req: Request) {
    const user = req.user as JwtPayload;

    return this.customerAddressesService.remove(
      new Types.ObjectId(user.sub),
      id,
    );
  }
}
