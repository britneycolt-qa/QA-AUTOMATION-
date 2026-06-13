import { defineConfig, type PlaywrightTestConfig } from '@playwright/test';
import path from 'node:path';

const isCI = !!process.env.CI;

export const baseConfig: PlaywrightTestConfig = {
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  timeout: 30_000,
  expect: { timeout: 10_000 },
  use: {
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    testIdAttribute: 'data-testid',
  },
};

export function createProjectConfig(overrides: PlaywrightTestConfig): PlaywrightTestConfig {
  const projectRoot = overrides.outputDir ? path.dirname(overrides.outputDir) : process.cwd();
  return defineConfig({
    ...baseConfig,
    ...overrides,
    use: { ...baseConfig.use, ...overrides.use },
    reporter: [
      ['html', { outputFolder: path.join(projectRoot, 'playwright-report'), open: 'never' }],
      ['list'],
      ['monocart-reporter', {
        name: `Reporte QA — ${path.basename(projectRoot)}`,
        outputFile: path.join(projectRoot, 'monocart-report', 'index.html'),
      }],
      ['json', { outputFile: path.join(projectRoot, 'test-results', 'results.json') }],
    ] as PlaywrightTestConfig['reporter'],
  });
}
