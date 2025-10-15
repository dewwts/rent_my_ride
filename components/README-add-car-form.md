# Add Car Form Component

## Overview
The `AddCarForm` component is a comprehensive form for adding new cars to the rental system. It includes client-side validation using Zod and React Hook Form, image upload functionality, and a modern UI design.

## Features
- ✅ **Client-side validation** using Zod schema
- ✅ **Image upload** with preview and validation
- ✅ **Form state management** using React Hook Form
- ✅ **Responsive design** with Tailwind CSS
- ✅ **TypeScript support** with proper type definitions
- ✅ **Error handling** with user-friendly messages
- ✅ **Loading states** for better UX

## Components

### 1. AddCarForm
Main form component for adding cars.

**Props:**
- `className?: string` - Additional CSS classes
- `onCarAdded?: (car: Car) => void` - Callback when car is successfully added
- `onCancel?: () => void` - Callback when form is cancelled

**Usage:**
```tsx
import { AddCarForm } from "@/components/add-car-form";

function MyComponent() {
  const handleCarAdded = (car: Car) => {
    console.log("New car added:", car);
  };

  return (
    <AddCarForm 
      onCarAdded={handleCarAdded}
      onCancel={() => console.log("Form cancelled")}
    />
  );
}
```

### 2. AddCarModal
Modal wrapper for the AddCarForm component.

**Props:**
- `isOpen: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onCarAdded?: (car: Car) => void` - Callback when car is successfully added

**Usage:**
```tsx
import { AddCarModal } from "@/components/add-car-modal";

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsModalOpen(true)}>
        Add Car
      </Button>
      
      <AddCarModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCarAdded={(car) => {
          console.log("New car added:", car);
          setIsModalOpen(false);
        }}
      />
    </>
  );
}
```

## Form Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `brand` | string | Yes | Car brand (e.g., Honda, Toyota) |
| `model` | string | Yes | Car model (e.g., Civic, Yaris) |
| `car_id` | string | Yes | License plate number |
| `seats` | number | Yes | Number of seats (1-50) |
| `oil_type` | string | Yes | Fuel type (เบนซิน, ดีเซล, ไฟฟ้า, etc.) |
| `gear_type` | string | Yes | Transmission type (ออโต้, กระปุก, etc.) |
| `price_per_day` | number | Yes | Daily rental price (1-100,000 THB) |
| `status` | enum | Yes | Car status (available/unavailable) |
| `image_url` | string | No | Car image URL (auto-generated from upload) |

## Validation Rules

### CarSchema (lib/schemas.ts)
```typescript
export const CarSchema = z.object({
  brand: z.string().min(1, "กรุณากรอกยี่ห้อรถ"),
  model: z.string().min(1, "กรุณากรอกรุ่นรถ"),
  car_id: z.string().min(1, "กรุณากรอกหมายเลขทะเบียนรถ"),
  seats: z.coerce.number().min(1, "จำนวนที่นั่งต้องมากกว่า 0").max(50, "จำนวนที่นั่งไม่ควรเกิน 50"),
  oil_type: z.string().min(1, "กรุณาเลือกประเภทเชื้อเพลิง"),
  gear_type: z.string().min(1, "กรุณาเลือกประเภทเกียร์"),
  price_per_day: z.coerce.number().min(1, "ราคาต่อวันต้องมากกว่า 0").max(100000, "ราคาต่อวันไม่ควรเกิน 100,000 บาท"),
  status: z.enum(["available", "unavailable"], {
    message: "กรุณาเลือกสถานะรถ",
  }),
  image_url: z.string().optional(),
});
```

## Image Upload

The form includes image upload functionality with:
- **File type validation**: Only image files are accepted
- **File size validation**: Maximum 5MB
- **Preview functionality**: Shows uploaded image before submission
- **Integration with Supabase**: Uses `uploadImageCar` service
- **Error handling**: User-friendly error messages

## Styling

The component uses Tailwind CSS classes and follows the existing design system:
- Consistent with other forms in the application
- Responsive design for mobile and desktop
- Proper spacing and typography
- Error states with red text
- Loading states with disabled buttons

## Dependencies

- `react-hook-form` - Form state management
- `@hookform/resolvers` - Zod integration
- `zod` - Schema validation
- `@/lib/schemas` - Validation schemas
- `@/lib/carServices` - Image upload service
- `@/components/ui/*` - UI components
- `@/types/carInterface` - TypeScript types

## Example Pages

### 1. Standalone Page
```tsx
// app/dashboard/cars/add/page.tsx
export default function AddCarPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <AddCarForm 
            onCarAdded={() => router.push("/dashboard/cars")}
            onCancel={() => router.push("/dashboard/cars")}
          />
        </div>
      </main>
    </div>
  );
}
```

### 2. Modal Integration
```tsx
// In any component
const [isModalOpen, setIsModalOpen] = useState(false);

<AddCarModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onCarAdded={(car) => {
    // Handle new car
    setIsModalOpen(false);
  }}
/>
```

## Error Handling

The component handles various error scenarios:
- **Validation errors**: Displayed inline with form fields
- **Upload errors**: Toast notifications with specific messages
- **Network errors**: Graceful fallback with user feedback
- **File validation**: Clear error messages for invalid files

## Accessibility

- Proper form labels and associations
- Keyboard navigation support
- Screen reader friendly
- Focus management in modal
- ARIA attributes where needed

## Future Enhancements

- [ ] Multiple image upload support
- [ ] Image cropping functionality
- [ ] Auto-save draft functionality
- [ ] Advanced validation rules
- [ ] Integration with external car APIs
- [ ] Bulk car import feature
