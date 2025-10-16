// "use client";
// import { useEffect, useState } from "react";
// //import { createClient } from "@/lib/supabase/client";
// import { QrCode, Wallet, Calendar, MapPin, Clock } from 'lucide-react';
// import { loadStripe } from "@stripe/stripe-js";
// import axios from "axios";
// import { toast } from "@/components/ui/use-toast";
// import { CarCheckout } from "@/types/carInterface";

// export default function OrderPage( car_info : CarCheckout) {
//     //const supabase = createClient();
//     const rid = car_info.rid;
//     const amount = car_info.total_price // example
//     const handlePaymentWithQR =async ()=>{
//         const response = await axios.post(`${process.env.NEXT_PUBLIC_SERVER_URL}/api/stripe/create-checkout-session`,{
//             amount:amount,
//             rid:rid
//         })
//         if (!response.data.success){
//             toast({
//                 variant:"destructive",
//                 title:"ไม่สำเร็จ",
//                 description:response.data.error
//             })
//             return
//         }
//         const checkoutUrl = response.data.data.url;
//         const sessionId = response.data.data.session_id;
//         window.location.href = checkoutUrl
//     }
//     return (
//         <main className="flex-1 py-8">
//             <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
//             {/* Header Section */}
//             <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//                 <h1 className="text-4xl font-semibold text-gray-900 mb-2">{car_info.car_brand} {car_info.car_model}</h1>
//                 <p className="text-2xl font-light text-gray-700">{rid}</p>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//                 {/* Left Column - Car Details */}
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                 <div className="flex items-center gap-3 mb-6">
//                     <div className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium">
//                     {car_info.r_date}
//                     </div>
//                     <div className="text-gray-600">{car_info.total_days}</div>
//                 </div>

//                 {/* Car Image */}
//                 <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg overflow-hidden mb-6">
//                 <img 
//                     src={car_info.car_image} 
//                     alt="Nissan GTR" 
//                     className="w-full h-64 object-cover"
//                 />
//                 </div>

//                 {/* Booking Details */}
//                 <div className="space-y-4">
//                     <div className="flex items-start gap-3">
//                         <Calendar className="w-5 h-5 text-black mt-1" />
//                         <div>
//                             <p className="font-medium text-gray-900">วันที่รับรถ</p>
//                             <p className="text-gray-600">{car_info.p_date}</p>
//                         </div>
//                     </div>
                    
//                     <div className="flex items-start gap-3">
//                         <Calendar className="w-5 h-5 text-black mt-1" />
//                         <div>
//                             <p className="font-medium text-gray-900">วันที่คืนรถ</p>
//                             <p className="text-gray-600">{car_info.e_date}</p>
//                         </div>
//                     </div>

//                     <div className="flex items-start gap-3">
//                         <MapPin className="w-5 h-5 text-black mt-1" />
//                         <div>
//                             <p className="font-medium text-gray-900">สถานที่รับรถ</p>
//                             <p className="text-gray-600">{car_info.localtion_take}</p>
//                         </div> 
//                     </div>
//                     <div className="flex items-start gap-3">
//                         <MapPin className="w-5 h-5 text-black mt-1" />
//                         <div>
//                             <p className="font-medium text-gray-900">สถานที่คืนรถ</p>
//                             <p className="text-gray-600">{car_info.location_return}</p>
//                         </div> 
//                     </div>
//                     <div className="flex items-start gap-3">
//                         <Clock className="w-5 h-5 text-black mt-1" />
//                         <div>
//                             <p className="font-medium text-gray-900">ระยะเวลาเช่า</p>
//                             <p className="text-gray-600">{car_info.total_days} วัน</p>
//                         </div>
//                     </div>
//                 </div>
//                 </div>

//                 {/* Right Column - Payment */}
//                 <div>
//                 {/* Order Summary */}
//                 <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
//                     <h2 className="text-xl font-bold text-gray-900 mb-4">ยอดชำระรวม</h2>
                    
//                     <div className="space-y-3 mb-4 border-t border-gray-200 pt-4">
//                     <div className="flex justify-between text-gray-600">
//                         <span>{car_info.amount} | {car_info.car_id} | {car_info.description}</span>
//                     </div>
//                     </div>

//                     <div>
//                     <div className="flex justify-between items-center">
//                         <span className="text-2xl font-bold text-black">{car_info.total_price} บาท</span>
//                     </div>
//                     </div>
//                 </div>

//                 {/* Payment Methods */}
//                 <div className="bg-white rounded-lg shadow-sm p-6">
//                     <h2 className="text-xl font-bold text-gray-900 mb-4">เลือกวิธีการชำระเงิน</h2>
                    
//                     <div className="space-y-3">
                    
//                     <button className="w-full flex items-center justify-center gap-4 p-5 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white transition-all"
//                     onClick={handlePaymentWithQR}>
//                         <img src="/icons/qr_payment.png" alt="QR Payment" className="w-8 h-8" />
//                         <span className="font-semibold text-lg text-gray-900">ชำระเงินด้วย QR Payment</span>
//                     </button>

//                     {/* <button className="w-full flex items-center justify-center gap-4 p-5 rounded-full border-2 border-gray-300 hover:border-gray-400 bg-white transition-all">
//                         <img src="/icons/true_money.png" alt="True Wallet" className="w-8 h-8" />
//                         <span className="font-semibold text-lg text-gray-900">ชำระเงินด้วย true wallet</span>
//                     </button> */}
//                     </div>

//                     <p className="text-sm text-gray-500 text-center mt-4">
//                     กรุณาชำระเงินภายใน 24 ชั่วโมง
//                     </p>
//                 </div>
//                 </div>
//             </div>
//             </div>
//         </main>
//     );
// }