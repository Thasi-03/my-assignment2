import { test, expect, request } from "@playwright/test";

test("results API: create and list", async ({ baseURL }) => {
  const api = await request.newContext();

  const createRes = await api.post(`${baseURL}/api/results`, {
    data: { player: "Playwright", timeSec: 12, score: 95, stages: 3 },
  });
  expect(createRes.ok()).toBeTruthy();
  const created = await createRes.json();
  expect(created?.id).toBeTruthy();

  const listRes = await api.get(`${baseURL}/api/results`);
  expect(listRes.ok()).toBeTruthy();
  const list = await listRes.json();
  expect(Array.isArray(list)).toBe(true);
  expect(list.find((r: any) => r.id === created.id)).toBeTruthy();
});
