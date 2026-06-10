module.exports = {
  apps: [
    {
      name: 'finance-ai-backend',
      cwd: './backend',
      script: 'src/server.js',
      instances: 1,
      exec_mode: 'fork',
      env_production: {
        NODE_ENV: 'production'
      }
    }
  ]
};
