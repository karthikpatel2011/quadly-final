import 'dotenv/config';
import { createApp } from './src/app.js';

const port = process.env.PORT || 4000;

createApp().listen(port, () => {
  console.log(`Quadly API listening on http://localhost:${port}`);
});
