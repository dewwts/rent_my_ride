import { test, expect } from '@playwright/test';
const url = "https://rentmyride-mu.vercel.app/"

test('Signout from authenticated state', async ({page}) => {
    await page.goto(url)
    await page.getByRole('button',{name:'ออกจากระบบ'}).click()
    // หาเจอเพราะ element Button เป็น as child ของ button โดยมี name เป็น "ออกจากระบบ"
    await expect(page.getByRole('button', { name: 'เข้าสู่ระบบ' })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL("https://rentmyride-mu.vercel.app/auth/login")
    // check ว่ากลับมาเป็น guest แล้วโดยการมองหาปุ่ม login
})

