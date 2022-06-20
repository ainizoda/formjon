import React from "react";

interface FormData<T> {
  values: T;
  errors: T;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  validateOnBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onSetField?: (name: string, value: boolean) => void;
}

interface FormProps<T> {
  initialData: T;
  validations: Record<keyof T, (value: T[keyof T]) => void>;
  onSubmit: (data: T) => void;
  onChange?: (data: T) => void;
  children: (formData: FormData<T>) => JSX.Element;
}

export function Form<T>({
  initialData,
  validations,
  onSubmit,
  onChange = () => {},
  children,
}: FormProps<T>): JSX.Element {
  const [data, setData] = React.useState<T>(initialData);
  const [errors, setErrors] = React.useState<T>({} as T);

  const validate = React.useMemo(
    () =>
      (data: T): boolean => {
        let hasError = false;

        for (let name in data) {
          const validation = validations[name];

          if (validation) {
            try {
              const err = validation(data[name]);

              if (err === null) {
                continue;
              }
            } catch (e: any) {
              setErrors((errors) => ({ ...errors, [name]: e.message }));

              hasError = true;
              continue;
            }
          }

          setErrors({ ...errors, [name]: undefined });
        }
        return !hasError;
      },

    [validations, errors]
  );

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (validate(data)) {
      let filteredData = {} as T;

      for (let name in data) {
        let value = data[name] as any;

        if (value !== "") {
          filteredData[name] = data[name];
        }
      }

      onSubmit(filteredData);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setData({ ...data, [name]: value });
    onChange(data);
  };

  
  const handleSetField = (name: string, value: boolean) => {
    setData({ ...data, [name]: value });
  }


  return (
    <form onSubmit={handleSubmit}>
      {children({
        values: data,
        errors,
        onChange: handleChange,
        onSetField: handleSetField,
        validateOnBlur: () => validate(data),
      })}
    </form>
  );
}
