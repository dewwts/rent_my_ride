import { Car } from "./carInterface";

export interface AddCarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCarAdded?: (car: Car) => void;
}

export interface AddCarFormProps {
  className?: string;
  onCarAdded?: (car: Car, image: File | null) => void;
  onCancel?: () => void;
}

export interface EditCarFormProps {
  car: Car;
  onCarUpdated?: (car: Car, image: File | null) => void;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

export interface DeleteCarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  car: Car | null;
  isLoading?: boolean;
}
