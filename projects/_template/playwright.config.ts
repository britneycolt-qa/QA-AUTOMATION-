import path from 'node:path';
import { createProjectConfig } from '../../config/playwright.config.base';
import 'dotenv/config';

const ROOT = __dirname;
export default createProjectConfig({
  testDir: path.join(ROOT, 'tests'),
  outputDir: path.join(ROOT, 'test-results'),
  use: { baseURL: process.env.BASE_URL },
});
