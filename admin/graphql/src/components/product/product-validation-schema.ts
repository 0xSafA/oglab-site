import * as yup from 'yup';
import { ProductType } from '__generated__/__types__';
import { ProductTypeOption } from './form-utils';
import { MAXIMUM_WORD_COUNT_FOR_RICH_TEXT_EDITOR } from '@/utils/constants';

export const productValidationSchema = yup.object().shape({
  name: yup.string().required('form:error-name-required'),
  product_type: yup.object().required('form:error-product-type-required'),
  sku: yup.mixed().when('product_type', {
    is: (productType: ProductTypeOption) =>
      productType?.value === ProductType.Simple,
    then: () => yup.string().nullable().required('form:error-sku-required'),
  }),
  price: yup.mixed().when('product_type', {
    is: (productType: ProductTypeOption) =>
      productType?.value === ProductType.Simple,
    then: () =>
      yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
  }),
  sale_price: yup
    .number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
    .positive('form:error-sale-price-must-positive')
    .nullable(),
  quantity: yup.mixed().when('product_type', {
    is: (productType: ProductTypeOption) =>
      productType?.value === ProductType.Simple,
    then: () =>
      yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
  }),
  unit: yup.string().required('form:error-unit-required'),
  type: yup.object().nullable().required('form:error-type-required'),
  status: yup.string().nullable().required('form:error-status-required'),
  variation_options: yup.array().of(
    yup.object().shape({
      price: yup
        .number()
        .typeError('form:error-price-must-number')
        .positive('form:error-price-must-positive')
        .required('form:error-price-required'),
      sale_price: yup
        .number()
        .transform((value) => (isNaN(value) ? undefined : value))
        .lessThan(yup.ref('price'), 'Sale Price should be less than ${less}')
        .positive('form:error-sale-price-must-positive')
        .nullable(),
      quantity: yup
        .number()
        .typeError('form:error-quantity-must-number')
        .positive('form:error-quantity-must-positive')
        .integer('form:error-quantity-must-integer')
        .required('form:error-quantity-required'),
      sku: yup.string().required('form:error-sku-required'),
      is_digital: yup.boolean(),
      digital_file_input: yup.object().when('is_digital', {
        is: true,
        then: () =>
          yup
            .object()
            .shape({
              id: yup.string().required(),
            })
            .required('Degigtal File is required'),
        otherwise: () =>
          yup
            .object()
            .shape({
              id: yup.string().notRequired(),
              original: yup.string().notRequired(),
            })
            .notRequired()
            .nullable(),
      }),
    }),
  ),
  is_digital: yup.boolean(),
  digital_file_input: yup.object().when('is_digital', {
    is: true,
    then: () =>
      yup.object().shape({
        id: yup.string().required(),
      }),
    otherwise: () =>
      yup
        .object()
        .shape({
          id: yup.string().notRequired(),
          original: yup.string().notRequired(),
        })
        .notRequired()
        .nullable(),
  }),
  description: yup
    .string()
    .max(
      MAXIMUM_WORD_COUNT_FOR_RICH_TEXT_EDITOR,
      'form:error-description-maximum-title',
    ),
  is_external: yup.boolean(),
  external_product_url: yup.object().when('is_external', {
    is: true,
    then: () =>
      yup.string().required('form:error-external-product-url-required'),
    otherwise: () => yup.string().notRequired().nullable(),
  }),
  external_product_button_text: yup.object().when('is_external', {
    is: true,
    then: () =>
      yup.string().required('form:error-external-product-button-text-required'),
    otherwise: () => yup.string().notRequired().nullable(),
  }),
});
