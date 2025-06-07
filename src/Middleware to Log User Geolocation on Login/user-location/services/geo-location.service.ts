import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { GeoLocationResponse, UserLocationData } from '../interfaces/geo-location.interface';

@Injectable()
export class GeoLocationService {
  private readonly logger = new Logger(GeoLocationService.name);
  private readonly API_URL = 'http://ip-api.com/json';

  async getLocationByIp(ipAddress: string): Promise<UserLocationData | null> {
    try {
      // Handle localhost and private IPs
      if (this.isPrivateOrLocalIp(ipAddress)) {
        this.logger.warn(`Private/Local IP detected: ${ipAddress}, using fallback`);
        return this.getFallbackLocation();
      }

      const response = await axios.get<GeoLocationResponse>(
        `${this.API_URL}/${ipAddress}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query`
      );

      const data = response.data;

      if (data.status === 'fail') {
        this.logger.error(`IP-API request failed for IP ${ipAddress}`);
        return null;
      }

      return {
        country: data.country || 'Unknown',
        countryCode: data.countryCode || 'XX',
        region: data.region || 'Unknown',
        regionName: data.regionName || 'Unknown',
        city: data.city || 'Unknown',
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || null,
        isp: data.isp || null,
      };
    } catch (error) {
      this.logger.error(`Error fetching location for IP ${ipAddress}:`, error.message);
      return null;
    }
  }

  private isPrivateOrLocalIp(ip: string): boolean {
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:127.0.0.1')) {
      return true;
    }

    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^169\.254\./,
    ];

    return privateRanges.some(range => range.test(ip));
  }

  private getFallbackLocation(): UserLocationData {
    return {
      country: 'Unknown',
      countryCode: 'XX',
      region: 'Unknown',
      regionName: 'Unknown',
      city: 'Unknown',
      latitude: 0,
      longitude: 0,
      timezone: null,
      isp: 'Local Network',
    };
  }

  // Alternative method using a different API (MaxMind GeoLite2 via ipapi.co)
  async getLocationByIpAlternative(ipAddress: string): Promise<UserLocationData | null> {
    try {
      if (this.isPrivateOrLocalIp(ipAddress)) {
        return this.getFallbackLocation();
      }

      const response = await axios.get(`https://ipapi.co/${ipAddress}/json/`);
      const data = response.data;

      if (data.error) {
        this.logger.error(`ipapi.co request failed for IP ${ipAddress}: ${data.reason}`);
        return null;
      }

      return {
        country: data.country_name || 'Unknown',
        countryCode: data.country_code || 'XX',
        region: data.region_code || 'Unknown',
        regionName: data.region || 'Unknown',
        city: data.city || 'Unknown',
        latitude: parseFloat(data.latitude) || 0,
        longitude: parseFloat(data.longitude) || 0,
        timezone: data.timezone || null,
        isp: data.org || null,
      };
    } catch (error) {
      this.logger.error(`Error fetching location from ipapi.co for IP ${ipAddress}:`, error.message);
      return null;
    }
  }
}
