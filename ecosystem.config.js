module.exports = {
  apps: [
    {
      name: 'oglab-site',
      script: 'npm',
      args: 'start',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        NODE_OPTIONS: '--no-deprecation'
      },
      autorestart: true
    }
  ]
};