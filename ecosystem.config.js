module.exports = {
  apps: [{
    name: 'marjad',
    script: 'node_modules/.bin/next',
    args: 'start',
    cwd: '/var/www/marjad',
    instances: 1,          // single instance — VPS is shared
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
    },
    max_memory_restart: '512M',
    error_file: '/var/log/pm2/marjad-error.log',
    out_file: '/var/log/pm2/marjad-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
  }],
};
