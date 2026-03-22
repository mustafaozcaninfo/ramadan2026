import { z } from 'zod';
import { SUPPORTED_CITIES } from '@/lib/prayer';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const timingsQuerySchema = z.object({
  date: z.string().regex(dateRegex).optional(),
  city: z.string().min(1).max(100).optional(),
  country: z.string().min(1).max(100).optional(),
});

export type TimingsQuery = z.infer<typeof timingsQuerySchema>;

export const pushSubscribeBodySchema = z.object({
  subscription: z.object({
    endpoint: z.string().url(),
    keys: z.object({
      p256dh: z.string().min(1),
      auth: z.string().min(1),
    }),
    expirationTime: z.number().nullable().optional(),
  }),
  locale: z.enum(['tr', 'en', 'ar']).optional(),
  reminderIntervals: z
    .array(z.union([z.literal(15), z.literal(10), z.literal(5), z.literal(0)]))
    .max(4)
    .optional(),
});

export type PushSubscribeBody = z.infer<typeof pushSubscribeBodySchema>;

export function getValidatedCityConfig(city?: string, country?: string) {
  if (!city || !country) return SUPPORTED_CITIES[0];
  const found = SUPPORTED_CITIES.find((c) => c.city === city && c.country === country);
  return found ?? SUPPORTED_CITIES[0];
}
