import { Message, Shop, User } from '__generated__/__types__';

export enum QueryProductsOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  NAME = 'NAME',
  STATUS = 'STATUS',
  UPDATED_AT = 'UPDATED_AT',
  PRICE = 'PRICE',
  SALE_PRICE = 'SALE_PRICE',
  MAX_PRICE = 'MAX_PRICE',
  MIN_PRICE = 'MIN_PRICE',
  QUANTITY = 'QUANTITY',
  SOLD_QUANTITY = 'SOLD_QUANTITY',
}

export enum QueryFaqsOrderByColumn {
  CREATED_AT = 'created_at',
  ID = 'id',
  NAME = 'faq_title',
  DESCRIPTION = 'faq_description',
  ISSUED_BY = 'issued_by',
  TYPE = 'faq_type',
}

export enum QueryTermsOrderByColumn {
  CREATED_AT = 'created_at',
  ID = 'id',
  NAME = 'title',
  DESCRIPTION = 'description',
  ISSUED_BY = 'issued_by',
  IS_APPROVED = 'is_approved',
  TYPE = 'type',
}
export enum QueryCouponsOrderByColumn {
  CREATED_AT = 'created_at',
  EXPIRE_AT = 'expire_at',
  ID = 'id',
  CODE = 'code',
  AMOUNT = 'amount',
  NAME = 'title',
  DESCRIPTION = 'description',
  MINIMUM_CART_AMOUNT = 'minimum_cart_amount',
  IS_APPROVE = 'is_approve',
  TYPE = 'type',
}

export enum QueryFlashSaleOrderByColumn {
  START_DATE = 'start_date',
  END_DATE = 'end_date',
  ID = 'id',
  TITLE = 'title',
  DESCRIPTION = 'description',
  SALE_STATUS = 'sale_status',
}

export enum QueryProductsHasCategoriesColumn {
  SLUG = 'SLUG',
}

export enum QueryProductsHasTypeColumn {
  SLUG = 'SLUG',
}

export enum OrderStatus {
  PENDING = 'order-pending',
  PROCESSING = 'order-processing',
  COMPLETED = 'order-completed',
  CANCELLED = 'order-cancelled',
  REFUNDED = 'order-refunded',
  FAILED = 'order-failed',
  AT_LOCAL_FACILITY = 'order-at-local-facility',
  OUT_FOR_DELIVERY = 'order-out-for-delivery',
}

export enum PaymentStatus {
  PENDING = 'payment-pending',
  PROCESSING = 'payment-processing',
  SUCCESS = 'payment-success',
  FAILED = 'payment-failed',
  REVERSAL = 'payment-reversal',
  COD = 'payment-cash-on-delivery',
}

export enum PaymentGateway {
  STRIPE = 'STRIPE',
  COD = 'CASH_ON_DELIVERY',
  CASH = 'CASH',
}

export enum ProductApprovedStatus {
  Publish = 'publish',
  Approved = 'approved',
  UnPublish = 'unpublish',
}

export enum StoreNoticeType {
  all_vendor = 'all_vendor',
  specific_vendor = 'specific_vendor',
  all_shop = 'all_shop',
  specific_shop = 'specific_shop',
}
export enum CouponType {
  FIXED = 'fixed',
  PERCENTAGE = 'percentage',
  FREE_SHIPPING = 'free_shipping',
}

export interface ItemProps {
  id: number;
  title: string;
}

export enum QueryRefundReasonsOrderByColumn {
  NAME = 'NAME',
  SLUG = 'SLUG',
  CREATED_AT = 'CREATED_AT',
  UPDATED_AT = 'UPDATED_AT',
}
export enum QueryRefundPolicyOrderByColumn {
  CREATED_AT = 'CREATED_AT',
  TITLE = 'TITLE',
  STATUS = 'STATUS',
  UPDATED_AT = 'UPDATED_AT',
}
export interface ProductTypeOptions {
  name: string;
  slug: string;
}

export interface MappedPaginatorInfo {
  currentPage: number;
  firstPageUrl: string;
  from: number;
  lastPage: number;
  lastPageUrl: string;
  links: any[];
  nextPageUrl: string | null;
  path: string;
  perPage: number;
  prevPageUrl: string | null;
  to: number;
  total: number;
  hasMorePages: boolean;
}

export enum FlashSaleType {
  PERCENTAGE = 'percentage',
  FIXED_RATE = 'fixed_rate',
  DEFAULT = 'percentage',
  // WALLET_POINT_GIFT = 'wallet_point_gift',
  // FREE_SHIPPING = 'free_shipping',
}

export interface Conversations {
  id: string;
  created_at: string;
  updated_at: string;
  shop_id: number;
  unseen?: boolean;
  user_id: string;
  user: User;
  shop: Shop;
  latest_message: Message;
}

export enum StoreNoticePriorityType {
  High = 'high',
  Medium = 'medium',
  Low = 'low',
}

export enum OwnerShipTransferStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

export declare type TransferShopOwnershipInput = {
  shop_id: string | number;
  vendor_id: string | number;
  message?: string;
};

export interface StickerCardProps {
  titleTransKey: string;
  icon?: JSX.Element;
  color?: string;
  price?: string | number;
  indicator?: 'up' | 'down';
  indicatorText?: string;
  note?: string;
  link?: string;
  linkText?: string;
  iconClassName?: string;
  subtitleTransKey?: string;
  iconBgStyle?: { [key: string]: string };
}
export interface OrderStickerCardProps extends StickerCardProps {
  key:
    | 'pending'
    | 'processing'
    | 'complete'
    | 'cancelled'
    | 'refunded'
    | 'failed'
    | 'localFacility'
    | 'outForDelivery'
    | 'total_earnings'
    | 'current_balance'
    | 'admin_commission_rate'
    | 'withdrawn_amount';
}

export interface BecomeSeller {
  language?: string;
  page_options: {
    page_options: BecomeSellerOptions;
  };
  commissions: CommissionItem[];
}

export interface BecomeSellerOptions {
  banner: {
    title: string;
    description: string;
    newsTickerTitle?: string;
    newsTickerURL?: string;
    button1Name?: string;
    button1Link?: string;
    button2Name?: string;
    button2Link?: string;
    image: AttachmentInput;
  };
  sellingStepsTitle: string;
  sellingStepsDescription: string;
  sellingStepsItem: SellingStepItemInput[];
  purposeTitle: string;
  purposeDescription: string;
  purposeItems: BusinessPurposeItemInput[];
  commissionTitle: string;
  commissionDescription: string;
  faqTitle: string;
  faqDescription: string;
  faqItems: { description: string; title: string }[];
}

export interface BecomeSellerInput {
  language?: string;
  page_options: BecomeSellerOptionsInput;
  commissions: CommissionItem[];
}

export interface BecomeSellerOptionsInput {
  banner: {
    title: string;
    description: string;
    newsTickerTitle?: string;
    newsTickerURL?: string;
    button1Name?: string;
    button1Link?: string;
    button2Name?: string;
    button2Link?: string;
    image: AttachmentInput;
  };
  sellingStepsTitle: string;
  sellingStepsDescription: string;
  sellingStepsItem: SellingStepItemInput[];
  purposeTitle: string;
  purposeDescription: string;
  purposeItems: BusinessPurposeItemInput[];
  commissionTitle: string;
  commissionDescription: string;
  faqTitle: string;
  faqDescription: string;
  faqItems: FaqItemInput[];
  isMultiCommissionRate: boolean;
  defaultCommissionDetails?: string;
  defaultCommissionRate: number;
  dashboard: ShowcaseInput;
  sellerOpportunity: ShowcaseInput;
  guidelineTitle: string;
  guidelineDescription: string;
  guidelineItems: GuidelineItemInput[];
  userStoryTitle: string;
  userStoryDescription?: string;
  userStories: UserStoryInput[];
  contact: ContactInput;
}

export interface Attachment {
  thumbnail: string;
  original: string;
  id?: string;
}

export interface AttachmentInput {
  thumbnail: string;
  original: string;
  id?: string;
  file_name?: string;
}

export interface SellingStepItemInput {
  id?: string;
  title: string;
  description: string;
  image: AttachmentInput;
}

export interface BusinessPurposeItemInput {
  description: string;
  title: string;
  icon?: {
    value: string;
  };
}

export interface FaqItemInput {
  title: string;
  description: string;
}

export interface GuidelineItemInput {
  title: string;
  link?: string;
}

export interface ShowcaseInput {
  title: string;
  description: string;
  buttonName: string;
  buttonLink: string;
  button2Name: string;
  button2Link: string;
  image: AttachmentInput;
}

export interface UserStoryInput {
  title: string;
  description: string;
  link: string;
  thumbnail: string;
}

export interface ContactInput {
  title: string;
  description: string;
}

export interface CommissionItem {
  id?: string;
  level: string;
  sub_level: string;
  description: string;
  min_balance: number;
  max_balance: number;
  commission: number;
  image?: AttachmentInput;
}
export interface BusinessPurposeItem {
  id?: string;
  description: string;
  title: string;
  icon: {
    value: string;
  };
}