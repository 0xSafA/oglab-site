import * as yup from 'yup';

export const attributeValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-attribute-name-required'),
  values: yup.array().of(
    yup.object().shape({
      value: yup.string().required('Value is required'),
      meta: yup.string().required('Meta is required'),
    })
  ),
});