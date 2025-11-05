"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { submitReview, checkReviewExists } from "@/lib/reviewServices";
import { getCarById } from "@/lib/carServices"; // Changed from getCar to getCarById
import type { Car } from "@/types/carInterface";
import Image from "next/image";

export default function ReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasReviewed, setHasReviewed] = useState(false);

  const carId = searchParams.get('car_id');
  const rentingId = searchParams.get('renting_id');

  useEffect(() => {
    const fetchData = async () => {
      if (!carId || !rentingId) {
        toast({
          variant: "destructive",
          title: "ข้อมูลไม่ครบถ้วน",
          description: "ไม่พบข้อมูลการเช่า",
        });
        router.push('/booking');
        return;
      }

      const supabase = createClient();
      
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          toast({
            variant: "destructive",
            title: "กรุณาเข้าสู่ระบบ",
            description: "คุณต้องเข้าสู่ระบบก่อนเพื่อส่งรีวิว",
          });
          router.push('/login');
          return;
        }
        setUserId(user.id);

        // Check if already reviewed
        const reviewExists = await checkReviewExists(supabase, rentingId);
        if (reviewExists) {
          setHasReviewed(true);
          toast({
            variant: "default",
            title: "คุณรีวิวแล้ว",
            description: "คุณได้รีวิวการเช่านี้ไปแล้ว",
          });
        }

        // Fetch car details using getCarById
        const carData = await getCarById(supabase, carId);
        if (!carData) {
          toast({
            variant: "destructive",
            title: "ไม่พบข้อมูลรถ",
            description: "ไม่สามารถโหลดข้อมูลรถได้",
          });
          router.push('/booking');
          return;
        }
        setCar(carData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          variant: "destructive",
          title: "เกิดข้อผิดพลาด",
          description: error instanceof Error ? error.message : "ไม่สามารถโหลดข้อมูลได้",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [carId, rentingId, router, toast]);

  const handleSubmitReview = async () => {
    if (!userId) {
      toast({
        variant: "destructive",
        title: "กรุณาเข้าสู่ระบบ",
        description: "คุณต้องเข้าสู่ระบบก่อนเพื่อส่งรีวิว",
      });
      return;
    }

    if (!rentingId || !carId) {
      toast({
        variant: "destructive",
        title: "ข้อมูลไม่ครบถ้วน",
        description: "ไม่พบข้อมูลการเช่า",
      });
      return;
    }

    if (hasReviewed) {
      toast({
        variant: "destructive",
        title: "คุณรีวิวแล้ว",
        description: "คุณได้รีวิวการเช่านี้ไปแล้ว",
      });
      return;
    }

    if (rating === 0) {
      toast({
        variant: "destructive",
        title: "กรุณาให้คะแนน",
        description: "กรุณาเลือกคะแนนดาวก่อนส่งรีวิว",
      });
      return;
    }

    if (!reviewText.trim()) {
      toast({
        variant: "destructive",
        title: "กรุณาเขียนความคิดเห็น",
        description: "กรุณาเขียนความคิดเห็นก่อนส่งรีวิว",
      });
      return;
    }

    const supabase = createClient();
    try {
      await submitReview(supabase, {
        rating: rating,
        comment: reviewText,
        reviewer_id: userId,
        target_id: carId,
        renting_id: rentingId,
      });

      toast({
        variant: "default",
        title: "ส่งรีวิวสำเร็จ!",
        description: "ขอบคุณสำหรับรีวิวของคุณ",
      });

      // Redirect back to booking page
      router.push('/booking');
    } catch (error: unknown) {
      let message = "Something went wrong";
      if (error instanceof Error) {
        message = error.message;
      }
      toast({
        variant: "destructive",
        title: "เกิดข้อผิดพลาด",
        description: message,
      });
    }
  };

  const handleBack = () => {
    router.push('/booking');
  };

  if (loading) {
    return (
      <main className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </main>
    );
  }

  if (hasReviewed) {
    return (
      <main className="bg-gray-50 min-h-screen p-10 font-mitr">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-lg">ย้อนกลับ</span>
          </button>

          <div className="rounded-2xl p-8 bg-green-50 border-2 border-green-200 text-center">
            <div className="text-6xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700 mb-2">
              คุณได้รีวิวการเช่านี้เรียบร้อยแล้ว
            </h2>
            <p className="text-green-600 mb-6">ขอบคุณสำหรับรีวิวของคุณ</p>
            <button
              onClick={handleBack}
              className="px-6 py-2 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors"
            >
              กลับไปหน้าประวัติการเช่า
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 min-h-screen p-10 font-mitr">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-lg">ย้อนกลับ</span>
        </button>

        <h1 className="text-3xl font-bold text-slate-900 mb-6">รีวิวการเช่ารถ</h1>

        {/* Car Information Card */}
        {car && (
          <div className="bg-white rounded-2xl p-6 shadow-md mb-6">
            <div className="flex gap-6 items-start">
              <div className="w-48 h-32 relative flex-shrink-0">
                {car.car_image ? (
                  <Image
                    src={car.car_image}
                    alt={`${car.car_brand} ${car.model}`}
                    fill={true}
                    className="rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-sm">
                    ไม่มีรูปภาพ
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  {car.car_brand} {car.model}
                </h2>
                <div className="text-slate-600 space-y-1">
                  <p>ปี: {car.year_created ?? "ไม่ระบุ"}</p>
                  <p>ที่นั่ง: {car.number_of_seats} ที่นั่ง</p>
                  <p>ประเภทเชื้อเพลิง: {car.oil_type}</p>
                  <p>ประเภทเกียร์: {car.gear_type}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Review Input Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md">
          <h2 className="text-2xl font-semibold text-slate-900 mb-6">แบ่งปันประสบการณ์ของคุณ</h2>
          
          {/* Rating Stars */}
          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-3">
              ให้คะแนน
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  onClick={() => setRating(star)}
                  className={`w-12 h-12 cursor-pointer transition-colors ${
                    star <= (hover || rating) ? "fill-yellow-400" : "fill-gray-300"
                  }`}
                  viewBox="0 0 24 24"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              ))}
            </div>
            {rating > 0 && (
              <p className="text-sm text-slate-500 mt-2">
                คุณให้ {rating} ดาว
              </p>
            )}
          </div>

          {/* Review Text */}
          <div className="mb-6">
            <label className="block text-slate-700 font-medium mb-3">
              ความคิดเห็น
            </label>
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="บอกเล่าประสบการณ์การเช่ารถของคุณ..."
              className="w-full h-40 p-4 border-2 border-gray-300 rounded-xl resize-none focus:outline-none focus:border-blue-500 text-slate-600"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button 
              onClick={handleSubmitReview}
              className="flex-1 px-6 py-3 bg-slate-900 text-white rounded-full hover:bg-slate-800 transition-colors font-medium text-lg"
            >
              ส่งรีวิว
            </button>
            <button
              onClick={handleBack}
              className="px-6 py-3 bg-gray-200 text-slate-700 rounded-full hover:bg-gray-300 transition-colors font-medium"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}