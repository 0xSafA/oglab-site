import * as yup from 'yup';

export const paymentValidationSchema = yup.object().shape({
    currency: yup.object().nullable().required('form:error-currency-required'),
    currencyOptions: yup.object().shape({
        fractions: yup
            .number()
            .min(1, 'form:error-fractional-grater-then-one-required')
            .max(5, 'form:error-fractional-not-grater-then-one-required')
            .typeError('form:error-fractions-must-be-number')
            .positive('form:error-fractions-must-positive')
            .required('form:error-currency-number of decimals-required'),
    })
});
