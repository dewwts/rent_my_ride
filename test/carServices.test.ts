import { uploadImageCar } from "@/lib/carServices"
import { uploadImage } from "@/lib/utils"


jest.mock('@/lib/utils',()=>({
    uploadImage:jest.fn(),
}))
interface userMock{
    id:string,
    email:string
}
describe('Upload Image function testing', ()=>{
    // clear mock
    beforeEach(()=>{
        jest.clearAllMocks()
    })
    test("Upload car image with authentication",async ()=>{
        const mockFile = new File(['testfilebra'], 'test.png',{type:'image/png'})
        const carid= 'car-123'
        const fakeURL = 'http:/klsadasdasdasadsa'
        const mockUser:userMock = { id: 'user123', email: 'test@example.com' };

        // ให้ Upload Image return mock fakeURL
        (uploadImage as jest.Mock).mockResolvedValue(fakeURL)

        // สร้าง supabase mock
        const mockSupabase: any = {
            auth:{
                getUser:jest.fn().mockResolvedValue({
                    data:{user:mockUser},
                    error:null
                })
            },
            from: jest.fn().mockReturnThis(), // mockReturnThis เพื่อให้ return ตัวเองกลับไปทำให้
            //  method upsert สามารถเรียกใช้ supabaseClient ต่อได้เพราะ upsert ใช้ supabaseClient ทำงาน
            update:jest.fn().mockReturnThis(),// assume ว่า upsert สำเร็จ
            eq:jest.fn().mockResolvedValue({
                error: null,
                data: [{ car_id: 'car-123', car_image: 'http://example.com/image.png' }]
            })
        }
        const publicURL = await uploadImageCar(mockSupabase,mockFile,carid)
        expect(publicURL).toBe(fakeURL)
        expect(mockSupabase.auth.getUser).toHaveBeenCalledTimes(1) // ตรวจสอบว่าถูกเรียก getUser 1 ครั้ง
        expect(uploadImage).toHaveBeenCalledWith('car',mockUser.id,mockFile,mockSupabase)
        expect(mockSupabase.from).toHaveBeenCalledWith('car_information') 
        expect(mockSupabase.update).toHaveBeenCalledWith({
          car_image: fakeURL
        });
        expect(mockSupabase.eq).toHaveBeenCalledWith("car_id", carid);
    })
    test("Upload image car without authentication", async()=>{
        const mockFile = new File(['fakebinary'], 'test.png', {type:'image/png'})
        const mockError = {message:"โปรดเข้าสู่ระบบ", code:'500'}
        const carid = 'car-123'
        const mockSupabase:any = {
            auth:{
                getUser:jest.fn().mockResolvedValue({
                    data:{user:null},
                    error:mockError
                })
            },
            from:jest.fn(),
            select:jest.fn()
        }
        await expect(uploadImageCar(mockSupabase,mockFile,carid)).rejects.toThrow("โปรดเข้าสู่ระบบก่อน")
        expect(mockSupabase.from).not.toHaveBeenCalled()
    })
})