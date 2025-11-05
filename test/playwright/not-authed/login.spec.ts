import { test, expect } from '@playwright/test';

function generateValidEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomString = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `test${randomString}@${randomDomain}`;
}

const email = generateValidEmail();

test.describe("Login Test", () => {
    test('TC2-1 Correct Format', async ({page}) => {
        //register
        await page.goto('https://rentmyride-mu.vercel.app/auth/sign-up', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await page.waitForURL('**/auth/sign-up-success');

        //login
        await page.goto('https://rentmyride-mu.vercel.app/auth/login', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await page.waitForURL('https://rentmyride-mu.vercel.app/dashboard', { timeout: 10000 }); // ปรับ URL ให้ตรงกับจริง เช่น /auth/success
        await expect(page).toHaveURL('https://rentmyride-mu.vercel.app/dashboard');
        await expect(page.getByRole('link', { name: 'สวัสดี, Love!' })).toBeVisible();
    });

    test('TC2-2 Email and password is empty', async ({page}) => {
        await page.goto('https://rentmyride-mu.vercel.app/auth/login', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('');
        await expect(page.locator('form')).toContainText('Email is required');
        await expect(page.locator('form')).toContainText('Password is required');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });
    
    test('TC2-3 Email is not in the system', async ({page}) => {
        await page.goto('https://rentmyride-mu.vercel.app/auth/login', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill('sfasfaf@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('123456');
        await expect(page.locator('form')).toContainText('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });

    test('TC2-4 Password is incorrect', async ({page}) => {
        await page.goto('https://rentmyride-mu.vercel.app/auth/login', {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
        await page.getByRole('textbox', { name: 'ที่อยู่อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน' }).fill('x');
        await expect(page.locator('form')).toContainText('อีเมลหรือรหัสผ่านไม่ถูกต้อง');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/login');
    });
});