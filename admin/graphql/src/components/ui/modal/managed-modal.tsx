import Modal from '@/components/ui/modal/modal';
import dynamic from 'next/dynamic';
import { MODAL_VIEWS, useModalAction, useModalState } from './modal.context';
import RefundReasonDeleteView from '@/components/refund-reason/refund-reason-delete-view';
import RefundPolicyDeleteView from '@/components/refund-policy/refund-policy-delete-view';
const AuthorDeleteView = dynamic(
  () => import('@/components/author/author-delete-view'),
);
const ManufacturerDeleteView = dynamic(
  () => import('@/components/manufacturer/manufacturer-delete-view'),
);
const ProductVariation = dynamic(
  () => import('@/components/product/variation/variation'),
);
const UserWalletPointsAddView = dynamic(
  () => import('@/components/user/user-wallet-points-add-view'),
);
const TagDeleteView = dynamic(() => import('@/components/tag/tag-delete-view'));
const TaxDeleteView = dynamic(() => import('@/components/tax/tax-delete-view'));
const BanCustomerView = dynamic(
  () => import('@/components/user/user-ban-view'),
);
const ShippingDeleteView = dynamic(
  () => import('@/components/shipping/shipping-delete-view'),
);
const CategoryDeleteView = dynamic(
  () => import('@/components/category/category-delete-view'),
);
const FaqDeleteView = dynamic(
  () => import('@/components/faqs/faq-delete-view'),
);
const TermsDeleteView = dynamic(
  () => import('@/components/terms/terms-delete-view'),
);
const CouponDeleteView = dynamic(
  () => import('@/components/coupon/coupon-delete-view'),
);
const StoreNoticeDeleteView = dynamic(
  () => import('@/components/store-notice/store-notice-delete-view'),
);
const OrderDeleteView = dynamic(
  () => import('@/components/order/order-delete-view'),
);
const ProductDeleteView = dynamic(
  () => import('@/components/product/product-delete-view'),
);
const TypeDeleteView = dynamic(
  () => import('@/components/group/group-delete-view'),
);
const AttributeDeleteView = dynamic(
  () => import('@/components/attribute/attribute-delete-view'),
);
const ApproveShopView = dynamic(
  () => import('@/components/shop/approve-shop-view'),
);
const DisApproveShopView = dynamic(
  () => import('@/components/shop/disapprove-shop-view'),
);
const RemoveStaffView = dynamic(
  () => import('@/components/shop/staff-delete-view'),
);

const ExportImportView = dynamic(
  () => import('@/components/product/import-export-modal'),
);

const AttributeExportImport = dynamic(
  () => import('@/components/attribute/attribute-import-export'),
);
const UpdateRefundConfirmationView = dynamic(
  () => import('@/components/refund/refund-confirmation-view'),
);
const RefundImageModal = dynamic(
  () => import('@/components/refund/refund-image-modal'),
);
const ReviewImageModal = dynamic(
  () => import('@/components/reviews/review-image-modal'),
);
const MakeAdminView = dynamic(
  () => import('@/components/user/make-admin-view'),
);
const CreateOrUpdateAddressForm = dynamic(
  () => import('@/components/address/create-or-update'),
);
const AddOrUpdateCheckoutContact = dynamic(
  () => import('@/components/checkout/contact/add-or-update'),
);
const SelectCustomer = dynamic(
  () => import('@/components/checkout/customer/select-customer'),
);

const QuestionReplyView = dynamic(
  () => import('@/components/question/question-reply-view'),
);
const QuestionDeleteView = dynamic(
  () => import('@/components/question/question-delete-view'),
);
const ReviewDeleteView = dynamic(
  () => import('@/components/reviews/review-delete-view'),
);
const AcceptAbuseReportView = dynamic(
  () => import('@/components/reviews/acccpt-report-confirmation'),
);
const DeclineAbuseReportView = dynamic(
  () => import('@/components/reviews/decline-report-confirmation'),
);
const AbuseReport = dynamic(() => import('@/components/reviews/abuse-report'));
const ComposerMessage = dynamic(
  () => import('@/components/message/compose-message'),
);
const SearchModal = dynamic(
  () => import('@/components/layouts/topbar/search-modal'),
);
const OpenAiModal = dynamic(() => import('@/components/openAI/openAI.modal'));
const DescriptionView = dynamic(
  () => import('@/components/shop-single/description-modal'),
);
const DisApproveTermView = dynamic(
  () => import('@/components/terms-and-conditions/disapprove-term-view'),
);
const ApproveTermView = dynamic(
  () => import('@/components/terms-and-conditions/approve-term-view'),
);
const FlashSaleDeleteView = dynamic(
  () => import('@/components/flash-sale/flash-sale-delete-view'),
);

const ApproveCouponView = dynamic(
  () => import('@/components/coupon/approve-coupon-view'),
);
const DisApproveCouponView = dynamic(
  () => import('@/components/coupon/disapprove-coupon-view'),
);

const FlashSaleRequestDeleteView = dynamic(
  () =>
    import(
      '@/components/flash-sale/vendor-request/flash-sale-vendor-request-delete-view'
    ),
);
const ApproveVendorFSRequestView = dynamic(
  () => import('@/components/flash-sale/vendor-request/approve-view'),
);
const DisApproveVendorFSRequestView = dynamic(
  () => import('@/components/flash-sale/vendor-request/disapprove-view'),
);
const OwnershipTransferRequestDeleteView = dynamic(
  () => import('@/components/ownership-transfer/ownership-transfer-delete-view'),
);

const TransferShopOwnershipView = dynamic(
  () => import('@/components/shop/transfer-shop-ownership-view'),
);

function renderModal(view: MODAL_VIEWS | undefined, data: any) {
  switch (view) {
    case 'DELETE_PRODUCT':
      return <ProductDeleteView />;
    case 'DELETE_TYPE':
      return <TypeDeleteView />;
    case 'DELETE_ATTRIBUTE':
      return <AttributeDeleteView />;
    case 'DELETE_CATEGORY':
      return <CategoryDeleteView />;
    case 'DELETE_FAQ':
      return <FaqDeleteView />;
    case 'DELETE_TERMS':
      return <TermsDeleteView />;
    case 'DELETE_ORDER':
      return <OrderDeleteView />;
    case 'DELETE_COUPON':
      return <CouponDeleteView />;
    case 'DELETE_STORE_NOTICE':
      return <StoreNoticeDeleteView />;
    case 'DELETE_TAX':
      return <TaxDeleteView />;
    case 'DELETE_SHIPPING':
      return <ShippingDeleteView />;
    case 'DELETE_TAG':
      return <TagDeleteView />;
    case 'DELETE_MANUFACTURER':
      return <ManufacturerDeleteView />;
    case 'DELETE_AUTHOR':
      return <AuthorDeleteView />;
    case 'BAN_CUSTOMER':
      return <BanCustomerView />;
    case 'SHOP_APPROVE_VIEW':
      return <ApproveShopView />;
    case 'SHOP_DISAPPROVE_VIEW':
      return <DisApproveShopView />;
    case 'DELETE_STAFF':
      return <RemoveStaffView />;
    case 'UPDATE_REFUND':
      return <UpdateRefundConfirmationView />;
    case 'ADD_OR_UPDATE_ADDRESS':
      return <CreateOrUpdateAddressForm />;
    case 'ADD_OR_UPDATE_CHECKOUT_CONTACT':
      return <AddOrUpdateCheckoutContact />;
    case 'REFUND_IMAGE_POPOVER':
      return <RefundImageModal />;
    case 'MAKE_ADMIN':
      return <MakeAdminView />;
    case 'EXPORT_IMPORT_PRODUCT':
      return <ExportImportView />;
    case 'EXPORT_IMPORT_ATTRIBUTE':
      return <AttributeExportImport />;
    case 'ADD_WALLET_POINTS':
      return <UserWalletPointsAddView />;
    case 'SELECT_PRODUCT_VARIATION':
      return <ProductVariation productSlug={data} />;
    case 'SELECT_CUSTOMER':
      return <SelectCustomer />;
    case 'REPLY_QUESTION':
      return <QuestionReplyView />;
    case 'DELETE_QUESTION':
      return <QuestionDeleteView />;
    case 'DELETE_REVIEW':
      return <ReviewDeleteView />;
    case 'ACCEPT_ABUSE_REPORT':
      return <AcceptAbuseReportView />;
    case 'DECLINE_ABUSE_REPORT':
      return <DeclineAbuseReportView />;
    case 'REVIEW_IMAGE_POPOVER':
      return <ReviewImageModal />;
    case 'ABUSE_REPORT':
      return <AbuseReport data={data} />;
    case 'COMPOSE_MESSAGE':
      return <ComposerMessage />;
    case 'GENERATE_DESCRIPTION':
      return <OpenAiModal />;
    case 'DELETE_REFUND_REASON':
      return <RefundReasonDeleteView />;
    case 'DELETE_REFUND_POLICY':
      return <RefundPolicyDeleteView />;
    case 'SEARCH_VIEW':
      return <SearchModal />;
    case 'DESCRIPTION_VIEW':
      return <DescriptionView />;
    case 'TERM_APPROVE_VIEW':
      return <ApproveTermView />;
    case 'TERM_DISAPPROVE_VIEW':
      return <DisApproveTermView />;
    case 'DELETE_FLASH_SALE':
      return <FlashSaleDeleteView />;
    case 'COUPON_APPROVE_VIEW':
      return <ApproveCouponView />;
    case 'COUPON_DISAPPROVE_VIEW':
      return <DisApproveCouponView />;
    case 'DELETE_FLASH_SALE_REQUEST':
      return <FlashSaleRequestDeleteView />;
    case 'VENDOR_FS_REQUEST_APPROVE_VIEW':
      return <ApproveVendorFSRequestView />;
    case 'VENDOR_FS_REQUEST_DISAPPROVE_VIEW':
      return <DisApproveVendorFSRequestView />;
    case 'TRANSFER_SHOP_OWNERSHIP_VIEW':
      return <TransferShopOwnershipView />;
    case 'DELETE_OWNERSHIP_TRANSFER_REQUEST':
      return <OwnershipTransferRequestDeleteView />;

    default:
      return null;
  }
}

const ManagedModal = () => {
  const { isOpen, view, data } = useModalState();
  const { closeModal } = useModalAction();

  return (
    <Modal open={isOpen} onClose={closeModal}>
      {renderModal(view, data)}
    </Modal>
  );
};

export default ManagedModal;
