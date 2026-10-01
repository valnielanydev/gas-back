import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CustomerAddresses } from './schemas/customer-addresses.schema';
import { ClientSession, Model, Types } from 'mongoose';
import { UpdateCustomerAddressDto } from './dto/update-customer-address.dto';
import { CreateCustomerAddressDto } from './dto/create-customer-address.dto';

@Injectable()
export class CustomerAdressesRepository {
  constructor(
    @InjectModel(CustomerAddresses.name)
    private customerAdressesModel: Model<CustomerAddresses>,
  ) {}

  async create(
    userId: Types.ObjectId,
    data: CreateCustomerAddressDto,
    session?: ClientSession,
  ) {
    const [address] = await this.customerAdressesModel.create(
      [{ ...data, userId }],
      {
        session,
      },
    );

    return address;
  }

  existsByUserId(userId: Types.ObjectId) {
    return this.customerAdressesModel.exists({ userId });
  }

  findAllByUserId(userId: Types.ObjectId) {
    return this.customerAdressesModel
      .find({ userId })
      .sort({ isDefault: -1, createdAt: -1 });
  }

  findOne(userId: Types.ObjectId, id: Types.ObjectId) {
    return this.customerAdressesModel.findOne({ _id: id, userId });
  }

  update(
    userId: Types.ObjectId,
    id: Types.ObjectId,
    data: UpdateCustomerAddressDto,
    session?: ClientSession,
  ) {
    return this.customerAdressesModel.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { returnDocument: 'after', runValidators: true, session },
    );
  }

  unsetDefault(
    userId: Types.ObjectId,
    session: ClientSession,
    exceptId?: Types.ObjectId,
  ) {
    return this.customerAdressesModel.updateMany(
      { userId, isDefault: true, ...(exceptId && { _id: { $ne: exceptId } }) },
      { $set: { isDefault: false } },
      { session },
    );
  }

  delete(userId: Types.ObjectId, id: Types.ObjectId) {
    return this.customerAdressesModel.findOneAndDelete({ _id: id, userId });
  }
}
