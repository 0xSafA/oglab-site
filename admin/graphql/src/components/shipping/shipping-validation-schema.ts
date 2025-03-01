import * as yup from 'yup';
import { ShippingType } from '__generated__/__types__';
export const shippingValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  type: yup.string().required('form:error-type-required'),
  amount: yup.mixed().when('type', {
    is: (value: string) => value !== ShippingType.Free,
    then: () =>
      yup
        .number()
        // .when('type', {
        //   is: (data: string) => data === ShippingType.Percentage,
        //   then: yup
        //     .number()
        //     .min(1, 'You can offered minimum 1%.')
        //     .max(99, 'You can offered maximum 99%.'),
        // })
        .typeError('form:error-amount-must-number')
        .positive('form:error-amount-must-positive')
        .required('form:error-amount-required'),
  }),
});
