module.exports = {
  apps: [
    {
      name: 'ezpg-payment',
      script: 'npm',
      args: 'start',
      cwd: '/home/www/ezpg',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 46566
      }
    }
  ]
};