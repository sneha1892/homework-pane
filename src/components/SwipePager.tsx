import React, { useState, useRef } from 'react';

interface SwipePagerProps {
  children: React.ReactNode[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export default function SwipePager({ children, currentPage: controlledPage, onPageChange }: SwipePagerProps) {
  const [internalPage, setInternalPage] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [touchStartY, setTouchStartY] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Use controlled or internal state
  const currentPage = controlledPage !== undefined ? controlledPage : internalPage;
  const setCurrentPage = controlledPage !== undefined ? onPageChange! : setInternalPage;

  const totalPages = React.Children.count(children);

  // Handle touch events for swiping
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const currentY = e.targetTouches[0].clientY;
    // If the user is scrolling vertically, do not hijack the gesture
    if (Math.abs(currentY - touchStartY) > 12) {
      return;
    }
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const threshold = 50; // Minimum swipe distance

    if (distance > threshold && currentPage < totalPages - 1) {
      // Swipe left - next page
      setCurrentPage(currentPage + 1);
    } else if (distance < -threshold && currentPage > 0) {
      // Swipe right - previous page
      setCurrentPage(currentPage - 1);
    }

    setTouchStart(0);
    setTouchEnd(0);
  };

  const goToPage = (page: number) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="swipe-pager">
      <div
        ref={containerRef}
        className="swipe-container"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          transform: `translateX(-${currentPage * 100}%)`,
          transition: 'transform 0.3s ease-out'
        }}
      >
        {React.Children.map(children, (child, index) => (
          <div key={index} className="swipe-page">
            {child}
          </div>
        ))}
      </div>

      {/* Navigation dots */}
      {totalPages > 1 && (
        <div className="swipe-dots">
          {Array.from({ length: totalPages }).map((_, index) => (
            <button
              key={index}
              className={`swipe-dot ${index === currentPage ? 'active' : ''}`}
              onClick={() => goToPage(index)}
              aria-label={`Go to page ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Arrow navigation (optional, for accessibility) */}
      {totalPages > 1 && (
        <>
          {currentPage > 0 && (
            <button
              className="swipe-arrow swipe-arrow-left"
              onClick={() => goToPage(currentPage - 1)}
              aria-label="Previous page"
            >
              ‹
            </button>
          )}
          {currentPage < totalPages - 1 && (
            <button
              className="swipe-arrow swipe-arrow-right"
              onClick={() => goToPage(currentPage + 1)}
              aria-label="Next page"
            >
              ›
            </button>
          )}
        </>
      )}
    </div>
  );
}

