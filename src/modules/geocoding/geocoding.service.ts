import { Injectable, Logger } from '@nestjs/common';
import { Geocoding } from './interfaces/geocoding.interface';
import { AwesomeApiResponse } from './interfaces/awesome-api-response.interface';
import { NominatimApiResponse } from './interfaces/nominatim-api-response.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeocodingService {
  private readonly logger = new Logger(GeocodingService.name);

  constructor(private readonly configService: ConfigService) {}

  async geocode(data: Geocoding): Promise<[number, number] | null> {
    if (data.postalCode) {
      const result = await this.findByCepAwesomeApi(data.postalCode);

      if (result !== null) return result;
    }

    return await this.findByStreetNominatim(data);
  }

  private async findByStreetNominatim(
    params: Geocoding,
  ): Promise<[number, number] | null> {
    try {
      const url = new URL('https://nominatim.openstreetmap.org/search');

      url.search = new URLSearchParams({
        street: params.street,
        city: params.city,
        state: params.state,
        country: 'Brazil',
        countrycodes: 'br',
        format: 'jsonv2',
        limit: '1',
      }).toString();

      const res = await fetch(url, {
        headers: {
          'User-Agent': `vaptgas/1.0 ${this.configService.get('EMAIL_ENTERPRISE')}`,
        },
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) return null;

      const [response] = (await res.json()) as NominatimApiResponse[];

      const lat = Number(response?.lat);
      const long = Number(response?.lon);

      if (
        !Number.isFinite(long) ||
        long === 0 ||
        !Number.isFinite(lat) ||
        lat === 0
      ) {
        return null;
      }

      return [long, lat];
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }

  private async findByCepAwesomeApi(
    cep: string,
  ): Promise<[number, number] | null> {
    try {
      const url = new URL(`https://cep.awesomeapi.com.br/json/${cep}`);

      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

      if (!res.ok) return null;

      const response = (await res.json()) as AwesomeApiResponse;

      const long = Number(response?.lng);
      const lat = Number(response?.lat);

      if (
        !Number.isFinite(long) ||
        long === 0 ||
        !Number.isFinite(lat) ||
        lat === 0
      ) {
        return null;
      }

      return [long, lat];
    } catch (error) {
      this.logger.error(error);
      return null;
    }
  }
}
