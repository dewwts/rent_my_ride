// // "use client";

// // import * as React from "react";

// // type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
// //   label: string;
// //   error?: string | null;
// // };

// // /** Reusable input+label+error with forwardRef (works great with RHF register) */
// // const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
// //   ({ label, error, className, name, ...props }, ref) => {
// //     // รวมคลาสพื้นฐาน + error + custom className
// //     const base =
// //       "h-10 rounded-md border px-3 focus:outline-none focus:ring-2 focus:border-transparent";
// //     const ring = "focus:ring-blue-500";
// //     const neutral = "border-gray-300 disabled:bg-gray-100 disabled:text-gray-500";
// //     const danger = error ? "border-red-500" : "";
// //     const classes = [base, ring, neutral, danger, className].filter(Boolean).join(" ");

// //     const id = props.id ?? (name ? `input-${name}` : undefined);

// //     return (
// //       <div className="grid gap-1.5">
// //         <label htmlFor={id} className="text-sm font-medium">
// //           {label}
// //         </label>
// //         <input ref={ref} id={id} name={name} className={classes} {...props} />
// //         {error ? <p className="text-xs text-red-600">{error}</p> : null}
// //       </div>
// //     );
// //   }
// // );

// // InputField.displayName = "InputField";
// // export default InputField;
// import React from 'react';

// interface InputFieldProps {
//   label: string;
//   placeholder?: string;
//   type?: string;
//   value?: string;
//   onChange?: (value: string) => void;
//   required?: boolean;
//   disabled?: boolean;
// }

// export default function InputField({ 
//   label, 
//   placeholder = "", 
//   type = "text", 
//   value = "", 
//   onChange, 
//   required = false,
//   disabled = false 
// }: InputFieldProps) {
//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (onChange) {
//       onChange(e.target.value);
//     }
//   };

//   return (
//     <div className="flex flex-col">
//       <label className="text-sm font-medium text-gray-700 mb-1">
//         {label}
//         {required && <span className="text-red-500 ml-1">*</span>}
//       </label>
//       <input
//         type={type}
//         placeholder={placeholder}
//         value={value}
//         onChange={handleChange}
//         required={required}
//         disabled={disabled}
//         className={`
//           px-3 py-2 border border-gray-300 rounded-md 
//           focus:outline-none focus:ring-2 focus:ring-[#2B09F7] focus:border-transparent
//           ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
//         `}
//       />
//     </div>
//   );
// }
// components/ui/inputfield.tsx

"use client";

import * as React from "react";

type InputFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string | null;
};

/** Reusable input+label+error with forwardRef (works great with RHF register) */
const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, className, name, ...props }, ref) => {
    // รวมคลาสพื้นฐาน + error + custom className
    const base =
      "h-10 rounded-md border px-3 focus:outline-none focus:ring-2 focus:border-transparent";
    const ring = "focus:ring-blue-500";
    const neutral = "border-gray-300 disabled:bg-gray-100 disabled:text-gray-500";
    const danger = error ? "border-red-500" : "";
    const classes = [base, ring, neutral, danger, className]
      .filter(Boolean)
      .join(" ");

    const id = props.id ?? (name ? `input-${name}` : undefined);

    return (
      <div className="grid gap-1.5">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {/*
          - ref, name, และ props อื่นๆ จาก register ถูกส่งมาที่ input โดยตรง
          - ทำให้ RHF ควบคุม input นี้ได้อย่างสมบูรณ์
        */}
        <input ref={ref} id={id} name={name} className={classes} {...props} />
        {error ? <p className="text-xs text-red-600">{error}</p> : null}
      </div>
    );
  }
);

InputField.displayName = "InputField";
export default InputField;