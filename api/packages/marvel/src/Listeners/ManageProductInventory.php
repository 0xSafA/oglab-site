<?php

namespace oglab\Listeners;

use Exception;
use Illuminate\Contracts\Queue\ShouldQueue;
use oglab\Database\Models\Product;
use oglab\Database\Models\Variation;
use oglab\Events\OrderCreated;

class ManageProductInventory implements ShouldQueue
{
    protected function updateProductInventory($product)
    {
        try {
            $updatedQuantity = $product->quantity - $product->pivot->order_quantity;
            if ($updatedQuantity > -1) {
                if (TRANSLATION_ENABLED) {
                    $this->updateTranslationsInventory($product, $updatedQuantity);
                } else {
                    Product::find($product->id)->update(['quantity' => $updatedQuantity]);
                }
                if (!empty($product->pivot->variation_option_id)) {
                    $variationOption = Variation::findOrFail($product->pivot->variation_option_id);
                    $variationOption->quantity = $variationOption->quantity - $product->pivot->order_quantity;
                    if (TRANSLATION_ENABLED) {
                        $this->updateVariationTranslationsInventory($variationOption, $variationOption->quantity);
                    } else {
                        $variationOption->update([['quantity' => $variationOption->quantity]]);
                    }
                }
            }
        } catch (Exception $th) {
            //
        }
    }

    public function updateTranslationsInventory($product, $updatedQuantity)
    {
        Product::where('sku', $product->sku)->update(['quantity' => $updatedQuantity]);
    }

    public function updateVariationTranslationsInventory($variationOption, $updatedQuantity)
    {
        Variation::where('sku', $variationOption->sku)->update(['quantity' => $updatedQuantity]);
    }



    /**
     * Handle the event.
     *
     * @param OrderCreated $event
     * @return void
     */
    public function handle(OrderCreated $event)
    {
        $products = $event->order->products;
        foreach ($products as $product) {
            $this->updateProductInventory($product);
        }
    }
}
