<?php

namespace oglab\Providers;

use App\Events\QuestionAnswered;
use App\Events\RefundApproved;
use App\Events\ReviewCreated;
use App\Listeners\CommissionRateUpdateListener;
use App\Listeners\RatingRemoved;
use App\Listeners\SendReviewNotification;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;
use oglab\Events\CommissionRateUpdateEvent;
use oglab\Events\DigitalProductUpdateEvent;
use oglab\Events\FlashSaleProcessed;
use oglab\Events\Maintenance;
use oglab\Events\MessageSent;
use oglab\Events\OrderCancelled;
use oglab\Events\OrderCreated;
use oglab\Events\OrderDelivered;
use oglab\Events\OrderProcessed;
use oglab\Events\OrderReceived;
use oglab\Events\OrderStatusChanged;
use oglab\Events\OwnershipTransferStatusControl;
use oglab\Events\StoreNoticeEvent;
use oglab\Events\PaymentFailed;
use oglab\Events\PaymentMethods;
use oglab\Events\PaymentSuccess;
use oglab\Events\ProcessUserData;
use oglab\Events\ProductReviewApproved;
use oglab\Events\ProductReviewRejected;
use oglab\Events\RefundRequested;
use oglab\Events\RefundUpdate;
use oglab\Events\ShopMaintenance;
use oglab\Events\ProcessOwnershipTransition;
use oglab\Listeners\SendQuestionAnsweredNotification;
use oglab\Listeners\MessageParticipantNotification;
use oglab\Listeners\SendMessageNotification;
use oglab\Listeners\ShopMaintenanceListener;
use oglab\Listeners\StoreNoticeListener;
use oglab\Listeners\AppDataListener;
use oglab\Listeners\CheckAndSetDefaultCard;
use oglab\Listeners\DigitalProductNotifyLogsListener;
use oglab\Listeners\FlashSaleProductProcess;
use oglab\Listeners\MaintenanceNotification;
use oglab\Listeners\OwnershipTransferStatusControlListener;
use oglab\Listeners\ProductInventoryDecrement;
use oglab\Listeners\ProductInventoryRestore;
use oglab\Listeners\ProductReviewApprovedListener;
use oglab\Listeners\ProductReviewRejectedListener;
use oglab\Listeners\Refund\SendRefundUpdateNotification;
use oglab\Listeners\SendOrderCreationNotification;
use oglab\Listeners\SendOrderCancelledNotification;
use oglab\Listeners\SendOrderDeliveredNotification;
use oglab\Listeners\SendOrderReceivedNotification;
use oglab\Listeners\SendOrderStatusChangedNotification;
use oglab\Listeners\SendPaymentFailedNotification;
use oglab\Listeners\SendPaymentSuccessNotification;
use oglab\Listeners\SendRefundRequestedNotification;
use oglab\Listeners\StoredMessagedNotifyLogsListener;
use oglab\Listeners\StoredOrderNotifyLogsListener;
use oglab\Listeners\StoredStoreNoticeNotifyLogsListener;
use oglab\Listeners\TransferredShopOwnershipNotification;

class EventServiceProvider extends ServiceProvider
{

    /**
     * The event listener mappings for the application.
     *
     * @var array
     */
    protected $listen = [
        DigitalProductUpdateEvent::class => [
            DigitalProductNotifyLogsListener::class
        ],
        FlashSaleProcessed::class => [
            FlashSaleProductProcess::class
        ],
        Maintenance::class => [
            MaintenanceNotification::class
        ],
        MessageSent::class => [
            MessageParticipantNotification::class,
            SendMessageNotification::class,
            StoredMessagedNotifyLogsListener::class
        ],
        OrderCreated::class => [
            SendOrderCreationNotification::class,
            StoredOrderNotifyLogsListener::class
        ],
        OrderReceived::class => [
            SendOrderReceivedNotification::class
        ],
        OrderProcessed::class => [
            ProductInventoryDecrement::class,
        ],
        OrderCancelled::class => [
            ProductInventoryRestore::class,
            SendOrderCancelledNotification::class
        ],
        OrderDelivered::class => [
            SendOrderDeliveredNotification::class
        ],
        OrderStatusChanged::class => [
            SendOrderStatusChangedNotification::class
        ],
        OwnershipTransferStatusControl::class => [
            OwnershipTransferStatusControlListener::class
        ],
        PaymentSuccess::class => [
            SendPaymentSuccessNotification::class
        ],
        PaymentFailed::class => [
            SendPaymentFailedNotification::class
        ],
        PaymentMethods::class => [
            CheckAndSetDefaultCard::class
        ],
        ProductReviewApproved::class => [
            ProductReviewApprovedListener::class,
        ],
        ProductReviewRejected::class => [
            ProductReviewRejectedListener::class,
        ],
        ProcessUserData::class => [
            AppDataListener::class
        ],
        ProcessOwnershipTransition::class => [
            TransferredShopOwnershipNotification::class,
        ],
        QuestionAnswered::class => [
            SendQuestionAnsweredNotification::class
        ],
        RefundApproved::class => [
            RatingRemoved::class
        ],
        ReviewCreated::class => [
            SendReviewNotification::class
        ],
        RefundRequested::class => [
            SendRefundRequestedNotification::class
        ],
        RefundUpdate::class => [
            SendRefundUpdateNotification::class
        ],
        StoreNoticeEvent::class => [
            StoreNoticeListener::class,
            StoredStoreNoticeNotifyLogsListener::class
        ],
        Maintenance::class => [
            MaintenanceNotification::class
        ],
        CommissionRateUpdateEvent::class => [
            CommissionRateUpdateListener::class
        ],
        ShopMaintenance::class => [
            ShopMaintenanceListener::class
        ]
    ];

    /**
     * Register any events for your application.
     *
     * @return void
     */
    public function boot()
    {
        parent::boot();

        //
    }
}
