import { test, expect } from '@playwright/test';

test.describe("Login Test", () => {
    test.beforeEach(async ({page}) => {
        await page.goto('https://rentmyride-mu.vercel.app/auth/login', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('button', { name: 'ยอมรับทั้งหมด' }).click();
    })
    test('TC2-1 Correct Format', async ({page}) => {
        //login
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill("tester@gmail.com");
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await page.waitForURL('https://rentmyride-mu.vercel.app/dashboard', { timeout: 60000 }); // ปรับ URL ให้ตรงกับจริง เช่น /auth/success
        await expect(page).toHaveURL('https://rentmyride-mu.vercel.app/dashboard');
        await expect(page.getByRole('link', { name: 'สวัสดี, test!' })).toBeVisible();
    });

    test('TC2-2 Email and password is empty', async ({page}) => {
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page.getByText('Email is required')).toBeVisible();
        await expect(page.getByText('Password is required')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });
    
    test('TC2-3 Email is not in the system', async ({page}) => {
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('ILoveSe@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page.locator('form')).toContainText('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });

    test('TC2-4 Password is incorrect', async ({page}) => {
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('tester@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('abcdef');
        await page.getByRole('button', { name: 'เข้าสู่ระบบ' }).click();
        await expect(page.locator('form')).toContainText('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });
});