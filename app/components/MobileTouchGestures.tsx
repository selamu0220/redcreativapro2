'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { useViewport } from '../hooks/useViewport';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGestureOptions {
  threshold?: number;
  velocity?: number;
  preventScroll?: boolean;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
}

interface PinchGestureOptions {
  threshold?: number;
  onPinchStart?: (scale: number) => void;
  onPinchMove?: (scale: number, delta: number) => void;
  onPinchEnd?: (scale: number) => void;
}

interface LongPressOptions {
  delay?: number;
  threshold?: number;
  onLongPress?: (event: TouchEvent) => void;
  onLongPressStart?: () => void;
  onLongPressEnd?: () => void;
}

interface DoubleTapOptions {
  delay?: number;
  threshold?: number;
  onDoubleTap?: (event: TouchEvent) => void;
}

// Hook para gestos de deslizamiento
export const useSwipeGesture = (options: SwipeGestureOptions) => {
  const {
    threshold = 50,
    velocity = 0.3,
    preventScroll = false,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown
  } = options;

  const touchStart = useRef<TouchPoint | null>(null);
  const touchEnd = useRef<TouchPoint | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
    touchEnd.current = null;
  }, [preventScroll]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (preventScroll) {
      e.preventDefault();
    }
    
    const touch = e.touches[0];
    touchEnd.current = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now()
    };
  }, [preventScroll]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const deltaTime = touchEnd.current.timestamp - touchStart.current.timestamp;
    
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const speed = distance / deltaTime;

    if (distance < threshold || speed < velocity) return;

    const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
    
    if (isHorizontal) {
      if (deltaX > 0) {
        onSwipeRight?.();
      } else {
        onSwipeLeft?.();
      }
    } else {
      if (deltaY > 0) {
        onSwipeDown?.();
      } else {
        onSwipeUp?.();
      }
    }

    // Vibración háptica
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(50);
    }
  }, [threshold, velocity, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Hook para gestos de pellizco (pinch)
export const usePinchGesture = (options: PinchGestureOptions) => {
  const {
    threshold = 0.1,
    onPinchStart,
    onPinchMove,
    onPinchEnd
  } = options;

  const initialDistance = useRef<number>(0);
  const currentScale = useRef<number>(1);
  const isPinching = useRef<boolean>(false);

  const getDistance = (touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2) {
      e.preventDefault();
      initialDistance.current = getDistance(e.touches[0], e.touches[1]);
      currentScale.current = 1;
      isPinching.current = true;
      onPinchStart?.(1);
    }
  }, [onPinchStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (e.touches.length === 2 && isPinching.current) {
      e.preventDefault();
      
      const currentDistance = getDistance(e.touches[0], e.touches[1]);
      const scale = currentDistance / initialDistance.current;
      const delta = scale - currentScale.current;
      
      if (Math.abs(delta) > threshold) {
        currentScale.current = scale;
        onPinchMove?.(scale, delta);
      }
    }
  }, [threshold, onPinchMove]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    if (isPinching.current) {
      isPinching.current = false;
      onPinchEnd?.(currentScale.current);
      
      // Vibración háptica
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(100);
      }
    }
  }, [onPinchEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Hook para pulsación larga
export const useLongPress = (options: LongPressOptions) => {
  const {
    delay = 500,
    threshold = 10,
    onLongPress,
    onLongPressStart,
    onLongPressEnd
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const startPosition = useRef<{ x: number; y: number } | null>(null);
  const isLongPressing = useRef<boolean>(false);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    startPosition.current = { x: touch.clientX, y: touch.clientY };
    
    timeoutRef.current = setTimeout(() => {
      isLongPressing.current = true;
      onLongPressStart?.();
      onLongPress?.(e);
      
      // Vibración háptica más intensa para pulsación larga
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }, delay);
  }, [delay, onLongPress, onLongPressStart]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!startPosition.current) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPosition.current.x;
    const deltaY = touch.clientY - startPosition.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance > threshold) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
  }, [threshold]);

  const handleTouchEnd = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    if (isLongPressing.current) {
      isLongPressing.current = false;
      onLongPressEnd?.();
    }
    
    startPosition.current = null;
  }, [onLongPressEnd]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd
  };
};

// Hook para doble toque
export const useDoubleTap = (options: DoubleTapOptions) => {
  const {
    delay = 300,
    threshold = 10,
    onDoubleTap
  } = options;

  const lastTap = useRef<{ x: number; y: number; timestamp: number } | null>(null);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const now = Date.now();
    const currentTap = { x: touch.clientX, y: touch.clientY, timestamp: now };
    
    if (lastTap.current) {
      const timeDiff = now - lastTap.current.timestamp;
      const distance = Math.sqrt(
        Math.pow(currentTap.x - lastTap.current.x, 2) +
        Math.pow(currentTap.y - lastTap.current.y, 2)
      );
      
      if (timeDiff < delay && distance < threshold) {
        onDoubleTap?.(e);
        
        // Vibración háptica para doble toque
        if (typeof window !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate([50, 25, 50]);
        }
        
        lastTap.current = null;
        return;
      }
    }
    
    lastTap.current = currentTap;
    
    setTimeout(() => {
      if (lastTap.current === currentTap) {
        lastTap.current = null;
      }
    }, delay);
  }, [delay, threshold, onDoubleTap]);

  return {
    onTouchEnd: handleTouchEnd
  };
};

// Componente de área táctil mejorada
interface MobileTouchAreaProps {
  children: React.ReactNode;
  className?: string;
  swipeOptions?: SwipeGestureOptions;
  pinchOptions?: PinchGestureOptions;
  longPressOptions?: LongPressOptions;
  doubleTapOptions?: DoubleTapOptions;
  enableRipple?: boolean;
  style?: React.CSSProperties;
}

export const MobileTouchArea: React.FC<MobileTouchAreaProps> = ({
  children,
  className = '',
  swipeOptions,
  pinchOptions,
  longPressOptions,
  doubleTapOptions,
  enableRipple = false,
  style
}) => {
  const { isMobile } = useViewport();
  const elementRef = useRef<HTMLDivElement>(null);
  const [ripples, setRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  
  const swipeGesture = useSwipeGesture(swipeOptions || {});
  const pinchGesture = usePinchGesture(pinchOptions || {});
  const longPressGesture = useLongPress(longPressOptions || {});
  const doubleTapGesture = useDoubleTap(doubleTapOptions || {});

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (enableRipple && isMobile) {
      const rect = elementRef.current?.getBoundingClientRect();
      if (rect) {
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        const id = Date.now();
        
        setRipples(prev => [...prev, { id, x, y }]);
        
        setTimeout(() => {
          setRipples(prev => prev.filter(ripple => ripple.id !== id));
        }, 600);
      }
    }
    
    swipeGesture.onTouchStart(e);
    pinchGesture.onTouchStart(e);
    longPressGesture.onTouchStart(e);
  }, [enableRipple, isMobile, swipeGesture, pinchGesture, longPressGesture]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    swipeGesture.onTouchMove(e);
    pinchGesture.onTouchMove(e);
    longPressGesture.onTouchMove(e);
  }, [swipeGesture, pinchGesture, longPressGesture]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    swipeGesture.onTouchEnd(e);
    pinchGesture.onTouchEnd(e);
    longPressGesture.onTouchEnd();
    doubleTapGesture.onTouchEnd(e);
  }, [swipeGesture, pinchGesture, longPressGesture, doubleTapGesture]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || !isMobile) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div
      ref={elementRef}
      className={`mobile-touch-area ${className}`}
      style={{
        position: 'relative',
        overflow: enableRipple ? 'hidden' : 'visible',
        ...style
      }}
    >
      {children}
      {enableRipple && ripples.map(ripple => (
        <div
          key={ripple.id}
          className="mobile-ripple"
          style={{
            position: 'absolute',
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.6)',
            transform: 'translate(-50%, -50%)',
            animation: 'mobile-ripple-effect 0.6s ease-out',
            pointerEvents: 'none'
          }}
        />
      ))}
    </div>
  );
};

// Hook combinado para múltiples gestos
export const useMobileGestures = (options: {
  swipe?: SwipeGestureOptions;
  pinch?: PinchGestureOptions;
  longPress?: LongPressOptions;
  doubleTap?: DoubleTapOptions;
}) => {
  const swipeGesture = useSwipeGesture(options.swipe || {});
  const pinchGesture = usePinchGesture(options.pinch || {});
  const longPressGesture = useLongPress(options.longPress || {});
  const doubleTapGesture = useDoubleTap(options.doubleTap || {});

  const combinedHandlers = {
    onTouchStart: (e: TouchEvent) => {
      swipeGesture.onTouchStart(e);
      pinchGesture.onTouchStart(e);
      longPressGesture.onTouchStart(e);
    },
    onTouchMove: (e: TouchEvent) => {
      swipeGesture.onTouchMove(e);
      pinchGesture.onTouchMove(e);
      longPressGesture.onTouchMove(e);
    },
    onTouchEnd: (e: TouchEvent) => {
      swipeGesture.onTouchEnd(e);
      pinchGesture.onTouchEnd(e);
      longPressGesture.onTouchEnd();
      doubleTapGesture.onTouchEnd(e);
    }
  };

  return combinedHandlers;
};

export default MobileTouchArea;
