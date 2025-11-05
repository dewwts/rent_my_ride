"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { submitReview, checkReviewExists } from "@/lib/reviewServices";
import { getCarById } from "@/lib/carServices";
import type { Car } from "@/types/carInterface";
import Image from "next/image";

// Separate the component that uses searchParams
function ReviewPageContent() {
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
        router.push('/dashboard/bookings');
        return;
      }

      const supabase = createClient();
      
      try {
        // Get current user
        //const { data: { user } } = await supabase.auth.getUser();
        //if (!user) {
          //toast({
            //variant: "destructive",
            //title: "กรุณาเข้าสู่ระบบ",
            //description: "คุณต้องเข้าสู่ระบบก่อนเพื่อส่งรีวิว",
          //});
          //router.push('/login');
          //return;
        //}
        //setUserId(user.id);

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
          router.push('/dashboard/bookings');
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
      router.push('/dashboard/bookings');
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
    router.push('/dashboard/bookings');
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

        <h1 className="text-3xl font-bold text-slate-900 mb-6">รีวิวการเช่ารถของคุณ</h1>

        {/* Review Input Section */}
        <div className="bg-white rounded-2xl p-8 shadow-md border-2 border-black max-w-4xl">
          {/* Review Text */}
          <div className="mb-6">
            <textarea 
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="เพิ่มความคิดเห็นของคุณ...."
              className="w-full h-32 p-4 rounded-lg resize-none focus:outline-none text-slate-600 text-lg"
            />
          </div>

            {/* Rating Stars and Submit Button (inline) */}
            <div className="flex items-center justify-end gap-4">
            {/* Stars */}
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    onClick={() => setRating(star)}
                    className={`w-8 h-8 cursor-pointer transition-colors ${
                    star <= (hover || rating) ? "fill-yellow-400" : "fill-gray-300"
                    }`}
                    viewBox="0 0 24 24"
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
                ))}
            </div>

            {/* Submit Button */}
            <button 
                onClick={handleSubmitReview}
                className="px-8 py-2 bg-slate-500 text-white rounded-full hover:bg-slate-800 transition-colors font-medium"
            >
                ส่ง
            </button>
            </div>
        </div>
      </div>
    </main>
  );
}

// Wrap the content in Suspense boundary
export default function ReviewPage() {
  return (
    <Suspense fallback={
      <main className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900 mx-auto mb-4"></div>
          <p className="text-slate-600">กำลังโหลด...</p>
        </div>
      </main>
    }>
      <ReviewPageContent />
    </Suspense>
  );
}