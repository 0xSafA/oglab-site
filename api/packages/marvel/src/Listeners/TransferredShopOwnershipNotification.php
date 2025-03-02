<?php

namespace oglab\Listeners;


use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;
use oglab\Events\ProcessOwnershipTransition;
use oglab\Notifications\TransferredShopOwnership;
use oglab\Traits\UsersTrait;

class TransferredShopOwnershipNotification implements ShouldQueue
{
    use UsersTrait;
    /**
     * Create the event listener.
     *
     * @return void
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     *
     * @param ProcessOwnershipTransition $event
     * @return void
     */
    public function handle(ProcessOwnershipTransition $event)
    {
        try {
            $shop = $event->shop;
            $previousOwner = $event->previousOwner;
            $newOwner = $event->newOwner;
            $users = [...$this->getAdminUsers(), $previousOwner, $newOwner];
            if ($users) {
                foreach ($users as $user) {
                    Notification::route('mail', [
                        $user->email,
                    ])->notify(new TransferredShopOwnership(
                        $shop,
                        $previousOwner,
                        $newOwner,
                        $event->optional
                    ));
                }
            }
        } catch (\Throwable $th) {
            Log::error("Error from TransferredShopOwnershipNotification: " . $th->getMessage());
        }
    }
}
