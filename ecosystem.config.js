module.exports = {
  apps: [
    {
      name: "medusa-server",
      script: "yarn",
      args: "start",
      cwd: "./medusa",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 9000
      },
      // Настройки для работы в фоновом режиме
      autorestart: true,
      max_restarts: 10,
      min_uptime: "1m",
      max_memory_restart: "1G",
      // Логирование
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      output: "./logs/medusa-output.log",
      error: "./logs/medusa-error.log",
      merge_logs: true,
      // Позволяет продолжать работу после выхода из SSH
      detached: true
    },
    {
      name: "ugodo-frontend",
      script: "yarn",
      args: "start",
      cwd: "./",
      watch: false,
      env: {
        NODE_ENV: "production",
        PORT: 8000
      },
      // Настройки для работы в фоновом режиме
      autorestart: true,
      max_restarts: 10,
      min_uptime: "1m",
      max_memory_restart: "1G",
      // Логирование
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      output: "./logs/frontend-output.log",
      error: "./logs/frontend-error.log",
      merge_logs: true,
      // Позволяет продолжать работу после выхода из SSH
      detached: true
    }
  ]
} 