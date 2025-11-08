// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'x-scheduler-backend',
      script: 'backend/src/server.js', // Correct path from project root
      instances: 1,
      exec_mode: 'fork',
      
      // --- CRITICAL: Set the environment variables explicitly ---
      env: {
        NODE_ENV: 'production',
        PORT: 4000,
        
        // --- MongoDB ---
        MONGO_URI: 'mongodb+srv://edison:Rohitmi%40264@cluster1.ahysjyx.mongodb.net/x-scheduler',

        // --- Redis (BullMQ) ---
        REDIS_HOST: 'redis-10686.c321.us-east-1-2.ec2.redns.redis-cloud.com', // Or your remote Redis IP
        REDIS_PORT: 10686,       // MUST be a valid number, not NaN
        REDIS_PASSWORD: 'bxVQiEAQIsD9Z3ga0AG5C1q9b5gfG840',     // Use your password or leave empty
        REDIS_USERNAME: 'default',
        
        // --- Security ---
        JWT_SECRET: 'YOUR_STRONG_SECRET_KEY_HERE',
      },
    },
  ],
};

