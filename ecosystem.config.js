module.exports = {
  apps: [
    {
      name: 'oglab-site',
      script: 'npm',
      args: 'start',
      cwd: '/Users/0xsafa/Documents/GitHub/oglab-site',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--no-deprecation'
      },
      env_development: {
        NODE_ENV: 'development',
        PORT: 3000,
        NODE_OPTIONS: '--no-deprecation'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        NODE_OPTIONS: '--no-deprecation'
      },
      // Логирование
      log_file: './logs/combined.log',
      out_file: './logs/out.log',
      error_file: './logs/error.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      
      // Автоперезапуск при изменениях файлов (только для разработки)
      watch: false,
      ignore_watch: ['node_modules', 'logs', '.git'],
      
      // Настройки перезапуска
      max_restarts: 10,
      min_uptime: '10s',
      max_memory_restart: '1G',
      
      // Автозапуск при перезагрузке системы
      autorestart: true,
      
      // Время ожидания для graceful shutdown
      kill_timeout: 5000,
      
      // Настройки для кластерного режима
      listen_timeout: 8000,
      wait_ready: true,
      
      // Переменные окружения для Next.js
      node_args: '--no-deprecation'
    }
  ],
  
  // Настройки деплоя (опционально)
  deploy: {
    production: {
      user: 'deploy',
      host: ['your-server.com'],
      ref: 'origin/main',
      repo: 'git@github.com:yourusername/oglab-site.git',
      path: '/var/www/oglab-site',
      'post-deploy': 'npm install && npm run build && pm2 reload ecosystem.config.js --env production',
      'pre-setup': 'apt update && apt install git -y'
    }
  }
};
