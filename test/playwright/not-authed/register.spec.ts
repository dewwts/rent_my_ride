import { test, expect } from '@playwright/test';

const URL = 'https://rentmyride-mu.vercel.app/auth/sign-up'

function generateValidEmail() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const randomString = Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const domains = ['gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com', 'icloud.com'];
  const randomDomain = domains[Math.floor(Math.random() * domains.length)];
  return `test${randomString}@${randomDomain}`;
}

test.describe("Sign up Test", () => {
    test.beforeEach(async ({page}) => {
        await page.goto(URL, {
            timeout : 60000,
            waitUntil : 'domcontentloaded'
        });
    })

    test('TC1-1 Correct Format', async ({page}) => {
        const email = generateValidEmail();
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await page.waitForURL('**/auth/sign-up-success');
        expect(page.url()).toBe('https://rentmyride-mu.vercel.app/auth/sign-up-success');
    });
    test('TC1-2 Data is empty', async ({page}) => {
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.locator('form')).toContainText('Firstname is required');
        await expect(page.locator('form')).toContainText('Lastname is required');
        await expect(page.locator('form')).toContainText('Email is required');
        await expect(page.locator('form')).toContainText('Password must be at least 6 characters');
        await expect(page.getByRole('main')).toContainText('สร้างบัญชี');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-3 Email without @', async ({page}) => {
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill('ILoveSe.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.getByText('Invalid email')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-4 Email without . (dot)', async ({page}) => {
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill('ILoveSe@gmailcom');
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.getByText('Invalid email')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-5 Email with special characters', async ({page}) => {
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill('I Love Se@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.getByText('Invalid email')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-6 Email with . more than one', async ({page}) => {
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill('ILoveSe@gmail..com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.getByText('Invalid email')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-7 Email with @ more than one', async ({page}) => {
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill('ILoveSe@@gmail.com');
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.getByText('Invalid email')).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-8 Duplicate email in the system', async ({page}) => {
        //signup email
        const email = generateValidEmail();
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await page.waitForURL('**/auth/sign-up-success');

        //signup again with duplicate email
        await page.goto('https://rentmyride-mu.vercel.app/auth/sign-up');
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123456');
        await page.getByRole('link', { name: 'ลงทะเบียน' }).click();

        await expect(page.getByText('Email already exists')).toBeVisible();
        //toast
        await expect(page.locator('div').filter({ hasText: 'Sign up ไม่สำเร็จEmail' }).nth(1)).toBeVisible();
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-9 Password length less than 6', async ({page}) => {
        const email = generateValidEmail();
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('12345');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('12345');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.locator('form')).toContainText('Password must be at least 6 characters');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
    test('TC1-10 Confirm password does not match password', async ({page}) => {
        const email = generateValidEmail();
        await page.getByRole('textbox', { name: 'ชื่อจริง' }).fill('Love');
        await page.getByRole('textbox', { name: 'นามสกุล' }).fill('Se');
        await page.getByRole('textbox', { name: 'อีเมล' }).fill(email);
        await page.getByRole('textbox', { name: 'รหัสผ่าน', exact: true }).fill('123456');
        await page.getByRole('textbox', { name: 'ยืนยันรหัสผ่าน' }).fill('123458');
        await page.getByRole('button', { name: 'ลงทะเบียน' }).click();
        await expect(page.locator('form')).toContainText('Passwords do not match');
        const currentUrl = await page.url();
        expect(currentUrl).toBe('https://rentmyride-mu.vercel.app/auth/sign-up');
    });
})