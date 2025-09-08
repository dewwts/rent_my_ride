interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
}

export default function InputField({
  label,
  type = "text",
  placeholder = "",
}: InputFieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-1 text-sm font-medium">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="border p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
      />
    </div>
  );
}
