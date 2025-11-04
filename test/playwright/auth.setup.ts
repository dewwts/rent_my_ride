import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json'
const url = "https://rentmyride-mu.vercel.app/auth/login"
setup('authenticate user and save strorage state', async({page})=>{
    await page.goto(url)
    await page.getByLabel("ที่อยู่อีเมล").fill("pholapcondo11@gmail.com")
    // หลักการคือ การใช้ getByLabel จะทำให้เราสามารถเข้าถึง input ที่มี label กำกับได้เลย โดยที่ argument ที่ใส่เข้าไปคือ ข้อความใน label
    // โดยที่มันรู้ว่าเป็น input ไหนจากการจับคู่ Label ที่ใช้ attribute htmlFor และ id ของ input ตรงกัน
    await page.getByLabel("รหัสผ่าน").fill("123456")
    await page.getByRole('button',{name:'เข้าสู่ระบบ'}).click()
    // getByRole ก็จะ access ว่ามี button อะไรบ้างจากนั้นจะใช้ name ในการจับคู่โดยที่ name ก็คือ ข้อความที่แสดงในปุ่ม
    await expect(page).toHaveURL("https://rentmyride-mu.vercel.app/dashboard")
    await page.context().storageState({path:authFile})
    // save state ไปที่ authFile
})