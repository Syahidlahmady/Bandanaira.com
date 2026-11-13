import React from 'react';

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`form-input ${error ? 'border-[#EF4444] focus:border-[#EF4444] focus:ring-red-200' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] mt-1">{helperText}</p>}
    </div>
  );
};

export interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: Array<{ value: string; label: string }>;
}

export const FormSelect: React.FC<FormSelectProps> = ({
  label,
  error,
  helperText,
  id,
  options,
  children,
  className = '',
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="form-label">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`form-select ${error ? 'border-[#EF4444] focus:border-[#EF4444]' : ''} ${className}`}
        {...props}
      >
        {options
          ? options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))
          : children}
      </select>
      {error && <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] mt-1">{helperText}</p>}
    </div>
  );
};

export interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  error,
  helperText,
  id,
  className = '',
  ...props
}) => {
  const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-textarea ${error ? 'border-[#EF4444] focus:border-[#EF4444]' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-[#EF4444] mt-1 font-medium">{error}</p>}
      {!error && helperText && <p className="text-xs text-[#64748B] mt-1">{helperText}</p>}
    </div>
  );
};

export const FormLabel: React.FC<React.LabelHTMLAttributes<HTMLLabelElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <label className={`form-label ${className}`} {...props}>
      {children}
    </label>
  );
};

export const FormError: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <p className={`text-xs text-[#EF4444] mt-1 font-medium ${className}`} {...props}>
      {children}
    </p>
  );
};

export default {
  Input: FormInput,
  Select: FormSelect,
  Textarea: FormTextarea,
  Label: FormLabel,
  Error: FormError,
};
