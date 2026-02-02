"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedNumber({ value, duration = 600, className = "" }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    const prevValue = Number(prevValueRef.current) || 0;
    const targetValue = Number(value) || 0;

    // Skip animation if value hasn't changed
    if (prevValue === targetValue) return;

    // Cancel any existing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    const difference = targetValue - prevValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = prevValue + difference * easeProgress;
      setDisplayValue(Math.round(currentValue));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = targetValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration]);

  return <span className={className}>{displayValue}</span>;
}

export function AnimatedPercentage({ value, duration = 600, decimals = 1, className = "" }) {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  const animationRef = useRef(null);

  useEffect(() => {
    const prevValue = Number(prevValueRef.current) || 0;
    const targetValue = Number(value) || 0;

    if (prevValue === targetValue) return;

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }

    const startTime = Date.now();
    const difference = targetValue - prevValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const easeProgress = 1 - Math.pow(1 - progress, 3);

      const currentValue = prevValue + difference * easeProgress;
      setDisplayValue(currentValue.toFixed(decimals));

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        prevValueRef.current = targetValue;
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value, duration, decimals]);

  return <span className={className}>{displayValue}</span>;
}
