import { isAdmin } from "@/lib/authServices";

describe('Test function isAdmin ', () => {
    let mockSupabase: any;

    beforeEach(() => {
        mockSupabase = {
            auth: {
                getUser: jest.fn(),
            },
            from: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn(),
        };
    });

    it('should return true if user exists and role is admin', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: '123',email: 'tester@gmail.com' } },
            error: null
        });
        mockSupabase.single.mockResolvedValue({
            data: { role: 'admin' },
            error: null
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(true);

    });

    it('should return false if user does not exist', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: null },
            error: null
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(false);


    });

    it('should return false if getUser have error', async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: {user: null},
            error : {message : 'auth error'}
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(false);
    });

    it('should return false if role error' , async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: '123',email: 'tester@gmail.com' } },
            error: null
        });
        mockSupabase.single.mockResolvedValue({
            data: null,
            error: {message:'role error'}
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(false);
    });

    it('should return false if user information does no exist' , async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: '123',email: 'tester@gmail.com' } },
            error: null
        });
        mockSupabase.single.mockResolvedValue({
            data: null,
            error: null
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(false);
    });

    it('should return false if role is not admin' , async () => {
        mockSupabase.auth.getUser.mockResolvedValue({
            data: { user: { id: '123',email: 'tester@gmail.com' } },
            error: null
        });
        mockSupabase.single.mockResolvedValue({
            data: { role: 'user' },
            error: null
        });

        const result = await isAdmin(mockSupabase);
        expect(result).toBe(false);
    });
});
