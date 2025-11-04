import { test, expect } from '@playwright/test';
const url = "https://rentmyride-mu.vercel.app/dashboard"

test("Access dashboard without authentication should redirect to login", async({page})=>{
    await page.goto(url)
    await expect(page).toHaveURL("https://rentmyride-mu.vercel.app/auth/login")
    // ตรวจสอบว่า ถูก redirect ไปที่หน้า login
})