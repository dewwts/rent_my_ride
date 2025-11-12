import { test, expect } from '@playwright/test';

const URL = "http://localhost:3000";

test.describe("Consent Test", () => {
    test('TC8-1 Consent Accepted', async ({page}) => {
        await page.goto(URL+"/auth/login", {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('button', { name: 'ยอมรับทั้งหมด' }).click();
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('tester@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.waitForURL(URL+"/dashboard", { timeout: 60000 });
        const currentUrl = await page.url();
        expect(currentUrl).toBe(URL+"/dashboard");
    });

    test('TC8-2 Consent Declined', async ({page}) => {
        await page.goto(URL+"/auth/login", {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('button', { name: 'ปฏิเสธ' }).click();
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('tester@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page.getByText('ไม่อนุญาตให้เข้าสู่ระบบ', { exact: true })).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe(URL+"/auth/login");
    })
});