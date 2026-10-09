import {
  forwardRef,
  type InputHTMLAttributes,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react';
import estilos from './form.module.css';

export const TextInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function TextInput({ className, ...resto }, ref) {
    return (
      <input
        ref={ref}
        className={[estilos.control, className].filter(Boolean).join(' ')}
        {...resto}
      />
    );
  },
);

export const TextArea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function TextArea({ className, ...resto }, ref) {
  return (
    <textarea
      ref={ref}
      className={[estilos.control, estilos.area, className].filter(Boolean).join(' ')}
      {...resto}
    />
  );
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
  function Select({ className, children, ...resto }, ref) {
    return (
      <select
        ref={ref}
        className={[estilos.control, className].filter(Boolean).join(' ')}
        {...resto}
      >
        {children}
      </select>
    );
  },
);
