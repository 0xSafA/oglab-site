<?php

namespace Marvel\Payments;

use Exception;
use Illuminate\Support\Facades\Http;
use Karim007\LaravelBkashTokenize\Facade\BkashPaymentTokenize;
use Marvel\Exceptions\MarvelException;
use Marvel\Payments\PaymentInterface;
use Marvel\Enums\OrderStatus;
use Marvel\Database\Models\Order;
use Marvel\Enums\PaymentStatus;
use Marvel\Traits\PaymentTrait;
use Marvel\Payments\Base;


class Bkash extends Base implements PaymentInterface
{

  use PaymentTrait;
  public BkashPaymentTokenize $bkashClient;

  public function __construct()
  {
    parent::__construct();
    $this->bkashClient = new BkashPaymentTokenize(config('shop.bkash.app_Key'), config('shop.bkash.app_secret'), config('shop.bkash.username'), config('shop.bkash.password'), config('shop.bkash.callback_url'));
  }

  public function getIntent($data): array
  {
    try {
      extract($data);
      $inv = uniqid();
      $params = [
        'intent' => 'sale',
        'mode' => '0011',
        'payerReference' => $inv,
        'currency' => $this->currency,
        'amount'   => round($amount),
        'merchantInvoiceNumber'   => $inv,
        'callbackURL' => config("shop.shop_url") . "/orders/{$order_tracking_number}/thank-you",
      ];

      $response =  BkashPaymentTokenize::cPayment(json_encode($params));

      return [
        'order_tracking_number'   => $order_tracking_number,
        'is_redirect'  => true,
        'payment_id'   => $response['paymentID'],
        'redirect_url' => $response['bkashURL']
      ];
    } catch (Exception $e) {
      throw new MarvelException(SOMETHING_WENT_WRONG_WITH_PAYMENT);
    }
  }


  public function verify($paymentId): mixed
  {

    try {
      $result = BkashPaymentTokenize::executePayment($paymentId);
      if (!$result) {
        $result =  BkashPaymentTokenize::queryPayment($paymentId);
      }
      if ($result['statusCode'] == '2023' || $result['statusCode'] == '2056') {
        return 'failed';
      }

      return isset($result['transactionStatus']) ? $result['transactionStatus'] : false;
    } catch (Exception $e) {
      throw new MarvelException(SOMETHING_WENT_WRONG_WITH_PAYMENT);
    }
  }

  /**
   * handleWebHooks
   *
   * @param  mixed  $request
   * @return void
   * @throws Throwable
   */
  public function handleWebHooks($request): void
  {
    // Verify webhook
   
  }

  /**
   * Update Payment and Order Status
   *
   * @param $request
   * @param $orderStatus
   * @param $paymentStatus
   * @return void
   */
  public function updatePaymentOrderStatus($request, $orderStatus, $paymentStatus): void
  {

    
  }


  /**
   * createCustomer
   *
   * @param  mixed  $request
   * @return array
   */
  public function createCustomer($request): array
  {
    return [];
  }

  /**
   * attachPaymentMethodToCustomer
   *
   * @param  string  $retrieved_payment_method
   * @param  object  $request
   * @return object
   */
  public function attachPaymentMethodToCustomer(string $retrieved_payment_method, object $request): object
  {
    return (object) [];
  }

  /**
   * detachPaymentMethodToCustomer
   *
   * @param  string  $retrieved_payment_method
   * @return object
   */
  public function detachPaymentMethodToCustomer(string $retrieved_payment_method): object
  {
    return (object) [];
  }


  public function retrievePaymentIntent($payment_intent_id): object
  {
    return (object) [];
  }

  /**
   * confirmPaymentIntent
   *
   * @param  string  $payment_intent_id
   * @param  array  $data
   * @return object
   */
  public function confirmPaymentIntent(string $payment_intent_id, array $data): object
  {
    return (object) [];
  }

  /**
   * setIntent
   *
   * @param  array  $data
   * @return array
   */
  public function setIntent(array $data): array
  {
    return [];
  }

  /**
   * retrievePaymentMethod
   *
   * @param  string  $method_key
   * @return object
   */
  public function retrievePaymentMethod(string $method_key): object
  {
    return (object) [];
  }
}
