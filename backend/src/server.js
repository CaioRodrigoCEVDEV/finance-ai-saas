const app = require('./app');
const env = require('./config/env');
const jobs = require('./jobs');

jobs.startAll();

app.listen(env.port, () => {
  console.log(`Finance AI API running on port ${env.port}`);
});
