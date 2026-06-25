import { BadGatewayException, Injectable } from '@nestjs/common';

@Injectable()
export class ExternalService {
  async getCountryInfo(countryName: string) {
    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(countryName)}`);

    if (!response.ok) {
      throw new BadGatewayException("Impossible de recuperer les informations du pays.");
    }

    const [country] = (await response.json()) as Array<{
      name: { common: string; official: string };
      capital?: string[];
      region: string;
      currencies?: Record<string, { name: string; symbol: string }>;
      flags: { png: string; alt?: string };
    }>;

    return {
      name: country.name.common,
      officialName: country.name.official,
      capital: country.capital?.[0] ?? null,
      region: country.region,
      currencies: country.currencies ?? {},
      flag: country.flags.png,
      flagAlt: country.flags.alt ?? null,
    };
  }
}
