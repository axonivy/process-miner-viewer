import { expect, test } from '@playwright/test';
import { ProcessMiner } from '../page-objects/process-miner';

test('minig data', async ({ page }) => {
  const miner = await ProcessMiner.openProcess(page);
  const title = miner.diagram.locator('.diagram-caption').first();
  await expect(title).toBeVisible();
  await expect(title).toHaveText('Analysis of ExampleProcess');

  const desc = miner.diagram.locator('.diagram-caption').last();
  await expect(desc).toBeVisible();
  await expect(desc).toContainText('1376 instances (investigation period:');

  await assertEdgeMinigData(miner, '1951D3C5BF69ADB3-f0', '30', '#c8f0d4');
  await assertEdgeMinigData(miner, '1951D3C5BF69ADB3-f3', '80', '#4ccd73');
});

const assertEdgeMinigData = async (miner: ProcessMiner, edgeSource: string, minigLabel: string, minigColor: string) => {
  const edge = miner.diagram.locator(`.sprotty-edge[data-svg-metadata-edge-source-id="sprotty_${edgeSource}"]`);
  await expect(edge).toBeVisible();
  const minigData = edge.locator('.label\\:mining');
  await expect(minigData).toHaveText(minigLabel);
  await expect(minigData.locator('circle')).toHaveAttribute('fill', minigColor);
};
