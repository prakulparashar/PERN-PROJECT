// middleware/tokenBucketRateLimit.js
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
  });
  
  client.on('error', (err) => console.error('Redis Client Error', err));
  client.on('connect', () => console.log('Connected to Redis'));
  
  // Connect the client
  (async () => {
    await client.connect();
  })();

  
  

const tokenBucketRateLimit = (options = {}) => {
  const {
    capacity = 10,           // max tokens in bucket
    refillRate = 1,          // tokens added per second
    keyPrefix = 'rate_limit:token_bucket:'
  } = options;

  return async (req, res, next) => {
    const identifier = req.ip || req.user?.id || 'anonymous';
    const key = `${keyPrefix}${identifier}`;
    
    try {
      const now = Date.now() / 1000; // seconds
      
      // Get current bucket state
      const multi = client.multi();
      multi.hGetAll(key);
      const [bucketData] = await multi.exec();
      
      let tokens = capacity;
      let lastRefill = now;
      
      if (bucketData && bucketData.tokens) {
        tokens = parseFloat(bucketData.tokens);
        lastRefill = parseFloat(bucketData.lastRefill);
        
        // Calculate tokens to add based on time elapsed
        const timePassed = now - lastRefill;
        const tokensToAdd = timePassed * refillRate;
        tokens = Math.min(capacity, tokens + tokensToAdd);
      }
      
      // Check if we have at least 1 token
      if (tokens >= 1) {
        // Consume 1 token
        tokens -= 1;
        
        // Update bucket state
        await client.hSet(key, {
          tokens: tokens.toString(),
          lastRefill: now.toString()
        });
        await client.expire(key, Math.ceil(capacity / refillRate) + 60);
        
        // Add rate limit headers
        res.setHeader('X-RateLimit-Limit', capacity);
        res.setHeader('X-RateLimit-Remaining', Math.floor(tokens));
        
        next();
      } else {
        // Rate limited
        const waitTime = (1 - tokens) / refillRate;
        res.setHeader('Retry-After', Math.ceil(waitTime));
        res.status(429).json({
          error: 'Too many requests',
          retryAfter: Math.ceil(waitTime)
        });
      }
    } catch (error) {
      console.error('Rate limit error:', error);
      next(); // Fail open - allow request if Redis fails
    }
  };
};

module.exports = tokenBucketRateLimit;