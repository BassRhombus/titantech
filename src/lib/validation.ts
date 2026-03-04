import { z } from 'zod';

// Server submission
export const serverSubmissionSchema = z.object({
  name: z.string().trim().min(3, 'Server name must be at least 3 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000),
  discordInvite: z.string().url('Invalid Discord invite URL').regex(/discord\.(gg|com\/invite)\//, 'Must be a valid Discord invite'),
  ownerDiscord: z.string().trim().min(2).max(32),
  serverIP: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Must be a valid IPv4 address'),
  queryPort: z.coerce.number().int().min(1, 'Port must be between 1 and 65535').max(65535),
  showIP: z.coerce.boolean().optional().default(false),
});

export const serverStatusUpdateSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  reason: z.string().trim().max(500).optional(),
});

// Server edit (owner can update these fields)
export const serverEditSchema = z.object({
  name: z.string().trim().min(3, 'Server name must be at least 3 characters').max(100).optional(),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(1000).optional(),
  discordInvite: z.string().url('Invalid Discord invite URL').regex(/discord\.(gg|com\/invite)\//, 'Must be a valid Discord invite').optional(),
  ownerDiscord: z.string().trim().min(2).max(32).optional(),
  serverIP: z.string().trim().regex(/^(\d{1,3}\.){3}\d{1,3}$/, 'Must be a valid IPv4 address').optional(),
  queryPort: z.coerce.number().int().min(1).max(65535).optional(),
  showIP: z.coerce.boolean().optional(),
});

// Suggestions
export const suggestionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be 100 characters or less'),
  category: z.enum(['features', 'map-changes', 'bugs', 'other'], { message: 'Invalid category' }),
  description: z.string().trim().min(1, 'Description is required').max(1000, 'Description must be 1000 characters or less'),
  author: z.string().trim().max(100).optional().default('Anonymous'),
});

export const commentSchema = z.object({
  text: z.string().trim().min(1, 'Comment text is required').max(500, 'Comment must be 500 characters or less'),
  author: z.string().trim().max(100).optional().default('Anonymous'),
});

// Events
export const eventSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(100),
  description: z.string().trim().min(10, 'Description must be at least 10 characters').max(2000),
  dateTime: z.string().datetime({ message: 'Invalid date/time format' }),
  endDateTime: z.string().datetime().optional(),
  serverName: z.string().trim().max(100).optional(),
  category: z.enum(['tournament', 'community', 'roleplay', 'pvp', 'other']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  discordLink: z.string().url().optional().or(z.literal('')),
});

export const eventUpdateSchema = eventSchema.partial().extend({
  status: z.enum(['active', 'cancelled', 'completed']).optional(),
});

// Profiles
export const profileSchema = z.object({
  name: z.string().trim().min(1, 'Profile name is required').max(50, 'Profile name cannot exceed 50 characters'),
  data: z.record(z.unknown()),
});

export const profileUpdateSchema = z.object({
  name: z.string().trim().min(1).max(50).optional(),
  data: z.record(z.unknown()).optional(),
});

export const generatorTypeSchema = z.enum(['commands-ini', 'game-ini', 'rules-motd', 'mod-manager']);

// Webhook
export const webhookGameIniSchema = z.object({
  fileType: z.string().trim().min(1),
  changedSettingsCount: z.number().int().min(0),
  timestamp: z.string().datetime().or(z.number().positive()),
});

// Helper to validate and return typed result
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: Array<{ field: string; message: string }> } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  const errors = result.error.issues.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }));
  return { success: false, errors };
}
