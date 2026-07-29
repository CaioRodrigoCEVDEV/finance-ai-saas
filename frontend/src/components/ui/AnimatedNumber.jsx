import { useEffect, useRef, useState } from 'react';
import { usePrivacy } from '../../contexts/PrivacyContext';

function useCountUp(end, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (end === 0 || end === null || end === undefined) {
      setValue(0);
      return;
    }

    const target = Number(end);
    if (Number.isNaN(target)) {
      setValue(0);
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return;
    }

    startTimeRef.current = null;

    function animate(timestamp) {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(target * eased * 100) / 100);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, duration]);

  return value;
}

function AnimatedNumber({ value, formatFn, className = '' }) {
  const { formatCurrencyPrivacy, hideValues } = usePrivacy();
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(Math.abs(numericValue));

  if (hideValues) {
    return <span className={className}>R$ {'••••••'}</span>;
  }

  const formatted = formatFn
    ? formatFn(animatedValue)
    : formatCurrencyPrivacy(animatedValue);

  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {numericValue < 0 ? '-' : ''}{typeof formatted === 'string' ? formatted : `R$ ${animatedValue.toLocaleString('pt-BR')}`}
    </span>
  );
}

export default AnimatedNumber;
