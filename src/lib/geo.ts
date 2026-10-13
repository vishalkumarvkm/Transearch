import { NextRequest } from 'next/server';
import { GeoLocationInfo } from './types/interaction';

const IP_CACHE = new Map<string, GeoLocationInfo>();

/**
 * Extracts the real client IP address from request headers.
 */
export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    // Return first IP from comma-separated list
    const ip = forwarded.split(',')[0].trim();
    if (ip) return ip;
  }

  const cfConnectingIp = request.headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  const clientIp = request.headers.get('x-client-ip');
  if (clientIp) return clientIp.trim();

  const trueClientIp = request.headers.get('true-client-ip');
  if (trueClientIp) return trueClientIp.trim();

  // NextRequest might have ip on request
  return (request as any).ip || '127.0.0.1';
}

/**
 * Checks if an IP is a private/loopback/local network address.
 */
export function isPrivateIp(ip: string): boolean {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') return true;
  if (ip.startsWith('10.') || ip.startsWith('192.168.')) return true;
  if (ip.startsWith('172.')) {
    const parts = ip.split('.');
    if (parts.length >= 2) {
      const second = parseInt(parts[1], 10);
      if (second >= 16 && second <= 31) return true;
    }
  }
  if (ip.startsWith('fc00:') || ip.startsWith('fd00:') || ip.startsWith('fe80:')) return true;
  return false;
}

/**
 * Resolves geolocation for an IP address.
 * Prioritizes platform headers (Vercel, Cloudflare), then memory cache, then IP API.
 */
export async function resolveGeoLocation(
  ip: string,
  request?: NextRequest
): Promise<GeoLocationInfo> {
  // Check memory cache
  if (IP_CACHE.has(ip)) {
    return IP_CACHE.get(ip)!;
  }

  // 1. Check platform headers if request object is provided
  if (request) {
    const vercelCountry = request.headers.get('x-vercel-ip-country');
    const vercelCity = request.headers.get('x-vercel-ip-city');
    const vercelRegion = request.headers.get('x-vercel-ip-country-region');
    const cfCountry = request.headers.get('cf-ipcountry');
    const cfCity = request.headers.get('cf-ipcity');

    if (vercelCountry || cfCountry) {
      const geo: GeoLocationInfo = {
        ip,
        city: vercelCity ? decodeURIComponent(vercelCity) : cfCity || 'Regional Hub',
        region: vercelRegion ? decodeURIComponent(vercelRegion) : undefined,
        country: vercelCountry || cfCountry || 'Global',
        countryCode: vercelCountry || cfCountry || 'UN',
        isLocal: false,
      };
      IP_CACHE.set(ip, geo);
      return geo;
    }
  }

  // 2. Local / Loopback check
  if (isPrivateIp(ip)) {
    const localGeo: GeoLocationInfo = {
      ip,
      city: 'Localhost / Internal Test',
      region: 'Workstation',
      country: 'Development Network',
      countryCode: 'DEV',
      isLocal: true,
    };
    IP_CACHE.set(ip, localGeo);
    return localGeo;
  }

  // 3. Fallback to public IP geolocation lookup with a strict 1500ms timeout
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    const response = await fetch(`https://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone`, {
      signal: controller.signal,
      cache: 'no-store',
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'success') {
        const geo: GeoLocationInfo = {
          ip,
          city: data.city || 'Unknown',
          region: data.regionName,
          country: data.country || 'Global',
          countryCode: data.countryCode || 'UN',
          timezone: data.timezone,
          isLocal: false,
        };
        IP_CACHE.set(ip, geo);
        return geo;
      }
    }
  } catch (err) {
    // Timeout or network unreachable
  }

  // 4. Default fallback
  const fallbackGeo: GeoLocationInfo = {
    ip,
    city: 'Direct Visitor',
    country: 'International',
    countryCode: 'GLOBAL',
    isLocal: false,
  };
  return fallbackGeo;
}

/**
 * Parses user agent string to detect device type.
 */
export function getDeviceType(userAgent?: string): 'Desktop' | 'Mobile' | 'Tablet' | 'Unknown' {
  if (!userAgent) return 'Unknown';
  const ua = userAgent.toLowerCase();
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'Tablet';
  if (/mobile|iphone|android.*mobile|blackberry|iemobile|opera mini/i.test(ua)) return 'Mobile';
  return 'Desktop';
}
