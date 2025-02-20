export function getReview(product: any) {
  if (product?.pivot?.variation_option_id) {
    return product?.my_review?.find(
      (review: any) =>
        review?.variation_option_id === product?.pivot?.variation_option_id,
    );
  } else {
    return product?.my_review?.[0];
  }
}

export function isAlreadyReviewedInThisOrder(
  product: any,
  orderId: any,
  settings: any,
) {
  if (settings?.reviewSystem?.value === 'review_single_time') {
    // condition for conventional review system
    return false;
  } else {
    // condition for each order basis review system

    // check if the review is checking in same order
    const isSameOrder = product?.my_review?.find(
      (item: any) => item?.order_id === orderId,
    );

    // if same order & product is digital
    if (isSameOrder && product?.is_digital) {
      return false;
    }

    // if same order & product is not digital
    if (isSameOrder) {
      return true;
    }
  }
}

export function reviewSystem(record: any, settings: any) {
  if (settings?.reviewSystem?.value === 'review_single_time') {
    // condition for conventional review system
    return getReview(record);
  } else {
    // condition for each order basis review system
    if (record?.is_digital) {
      // product is digital
      return getReview(record);
    } else {
      // product not digital
      return null;
    }
  }
}
