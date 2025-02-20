import { yupResolver } from '@hookform/resolvers/yup';
import {
  useForm,
  UseFormReturn,
  SubmitHandler,
  UseFormProps,
} from 'react-hook-form';

type FormProps<TFormValues> = {
  //@ts-ignore
  onSubmit: SubmitHandler<TFormValues>;
  //@ts-ignore
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  validationSchema?: any;
  className?: string;
  //@ts-ignore
  options?: UseFormProps<TFormValues>;
};

export const Form = <
  TFormValues extends Record<string, any> = Record<string, any>,
>({
  onSubmit,
  className,
  children,
  options,
  validationSchema,
  ...props
}: FormProps<TFormValues>) => {
  const methods = useForm<TFormValues>(
    //@ts-ignore
    {
      ...(!!validationSchema && {
        resolver: yupResolver(validationSchema),
      }),
      ...(!!options && options),
    },
  );
  return (
    <form
      className={className}
      onSubmit={methods.handleSubmit(onSubmit)}
      noValidate
      {...props}
    >
      {children(methods)}
    </form>
  );
};
