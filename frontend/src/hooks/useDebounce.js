import { useState, useEffect } from 'react';

// Хук useDebounce принимает значение и задержку, 
// и возвращает новое значение, которое обновляется только после того, 
// как исходное значение не менялось в течение указанной задержки.

function useDebounce(value, delay) {
  // Состояние для хранения "отложенного" значения
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Устанавливаем таймер, который обновит "отложенное" значение
      // после задержки. 
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Эта функция будет вызвана при каждом изменении `value` или `delay`,
      // а также при размонтировании компонента. Она очищает предыдущий таймер.
      // Это предотвращает обновление значения, если `value` изменился до истечения задержки.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Эффект перезапускается только при изменении value или delay
  );

  return debouncedValue;
}

export { useDebounce }; // Именной экспорт
