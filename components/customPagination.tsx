import { ChevronLeft,ChevronRight } from "lucide-react";

const CustomPagination = ({ currentPage, totalPages, onPageChange }: { 
    currentPage: number; 
    totalPages: number; 
    onPageChange: (page: number) => void;
}) => {
    const pagesToShow = 5; 
    
    let startPage = 1;
    let endPage = totalPages;

    if (totalPages > pagesToShow) {
        startPage = Math.max(1, currentPage - Math.floor(pagesToShow / 2));
        endPage = Math.min(totalPages, startPage + pagesToShow - 1);

        if (endPage === totalPages) {
            startPage = Math.max(1, totalPages - pagesToShow + 1);
        }
    }

    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    
    const isPrevDisabled = currentPage === 1;
    const isNextDisabled = currentPage === totalPages;

    return (
        <div className="flex items-center space-x-2 text-sm font-mitr">
            {/* ปุ่ม ก่อนหน้า */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={isPrevDisabled}
                className={`px-3 py-2 rounded-lg transition ${
                    isPrevDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                } flex items-center`}
            >
                <ChevronLeft size={16} />
                <span className="ml-1">ก่อนหน้า</span>
            </button>

            {/* หมายเลขหน้า */}
            {pages.map(page => (
                <button
                    key={page}
                    onClick={() => onPageChange(page)}
                    className={`h-9 w-9 rounded-lg transition font-medium ${
                        page === currentPage 
                            ? "bg-gray-900 text-white" 
                            : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {page}
                </button>
            ))}
            
            {/* ปุ่ม ถัดไป */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={isNextDisabled}
                className={`px-3 py-2 rounded-lg transition ${
                    isNextDisabled
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-gray-700 hover:bg-gray-100"
                } flex items-center`}
            >
                <span className="mr-1">ถัดไป</span>
                <ChevronRight size={16} />
            </button>
        </div>
    );
};

export default CustomPagination;