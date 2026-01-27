/**
 * Vercel Serverless Function: Pet Dogs Stats Tracker
 *
 * Tracks treats and scritches counts for each dog using Upstash Redis.
 * Stores data server-side and persists across sessions.
 *
 * Endpoint: POST /api/pet-dogs (increment stats)
 * Endpoint: GET /api/pet-dogs (fetch current stats)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface PetDogsRequest {
  dogName: string;
  action: 'treat' | 'scritch';
}

interface DogStats {
  treats: number;
  scritches: number;
}

/**
 * Validates the request data
 */
function validateRequest(
  data: unknown
): { valid: true; data: PetDogsRequest } | { valid: false; error: string } {
  if (!data || typeof data !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { dogName, action } = data as Record<string, unknown>;

  if (!dogName || typeof dogName !== 'string') {
    return { valid: false, error: 'dogName is required and must be a string' };
  }

  if (!action || typeof action !== 'string') {
    return { valid: false, error: 'action is required and must be a string' };
  }

  if (action !== 'treat' && action !== 'scritch') {
    return {
      valid: false,
      error: 'action must be either "treat" or "scritch"',
    };
  }

  return {
    valid: true,
    data: {
      dogName: dogName.trim(),
      action: action as 'treat' | 'scritch',
    },
  };
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST and GET requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // GET request - return current stats
  if (req.method === 'GET') {
    try {
      // Dynamic import of @upstash/redis (only load if available)
      let redis: typeof import('@upstash/redis');
      try {
        redis = await import('@upstash/redis');
      } catch {
        // Redis not available, return empty stats
        res.status(200).json({
          stats: {
            Nala: { treats: 0, scritches: 0 },
            Rosie: { treats: 0, scritches: 0 },
            Tito: { treats: 0, scritches: 0 },
          },
        });
        return;
      }

      // Use Vercel KV environment variable names (KV_REST_API_URL, KV_REST_API_TOKEN)
      const redisUrl = process.env.KV_REST_API_URL;
      const redisToken = process.env.KV_REST_API_TOKEN;

      if (!redisUrl || !redisToken) {
        // Redis not configured, return empty stats
        res.status(200).json({
          stats: {
            Nala: { treats: 0, scritches: 0 },
            Rosie: { treats: 0, scritches: 0 },
            Tito: { treats: 0, scritches: 0 },
          },
        });
        return;
      }

      const client = new redis.Redis({
        url: redisUrl,
        token: redisToken,
      });
      const stats: Record<string, DogStats> = {
        Nala: { treats: 0, scritches: 0 },
        Rosie: { treats: 0, scritches: 0 },
        Tito: { treats: 0, scritches: 0 },
      };

      // Load stats for each dog
      for (const dogName of ['Nala', 'Rosie', 'Tito']) {
        const stored = await client.get<DogStats>(`pet-dogs:${dogName}`);
        if (stored) {
          stats[dogName] = stored;
        }
      }

      res.status(200).json({ stats });
    } catch (error) {
      console.error('Error fetching pet dogs stats:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
    return;
  }

  // POST request - increment counter
  const validation = validateRequest(req.body);
  if (validation.valid === false) {
    res.status(400).json({ error: validation.error });
    return;
  }

  const { dogName, action } = validation.data;

  try {
    // Dynamic import of @upstash/redis (only load if available)
    let redis: typeof import('@upstash/redis');
    try {
      redis = await import('@upstash/redis');
    } catch {
      // Redis not configured - return success but don't persist
      console.warn('Upstash Redis not configured - stats not persisted');
      res.status(200).json({
        success: true,
        message: 'Stats updated (Redis not configured)',
      });
      return;
    }

    // Use Vercel KV environment variable names (KV_REST_API_URL, KV_REST_API_TOKEN)
    const redisUrl = process.env.KV_REST_API_URL;
    const redisToken = process.env.KV_REST_API_TOKEN;

    if (!redisUrl || !redisToken) {
      // Redis not configured - return success but don't persist
      console.warn('Upstash Redis not configured - stats not persisted');
      res.status(200).json({
        success: true,
        message: 'Stats updated (Redis not configured)',
      });
      return;
    }

    const client = new redis.Redis({
      url: redisUrl,
      token: redisToken,
    });
    const key = `pet-dogs:${dogName}`;

    // Get current stats
    const currentStats = (await client.get<DogStats>(key)) || {
      treats: 0,
      scritches: 0,
    };

    // Increment the appropriate counter
    const updatedStats: DogStats = {
      ...currentStats,
      [action === 'treat' ? 'treats' : 'scritches']:
        (currentStats[action === 'treat' ? 'treats' : 'scritches'] || 0) + 1,
    };

    // Save updated stats
    await client.set(key, updatedStats);

    res.status(200).json({
      success: true,
      stats: updatedStats,
    });
  } catch (error) {
    console.error('Error updating pet dogs stats:', error);
    res.status(500).json({
      error: 'Failed to update stats. Please try again later.',
    });
  }
}
