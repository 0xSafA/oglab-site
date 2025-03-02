<?php

namespace oglab\Database\Repositories;

use App\Events\ReviewCreated;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use oglab\Database\Models\Conversation;
use oglab\Database\Models\Message;
use oglab\Database\Models\Participant;
use oglab\Events\MessageSent;
use oglab\Exceptions\oglabException;
use Prettus\Repository\Criteria\RequestCriteria;
use Prettus\Repository\Exceptions\RepositoryException;
use Stevebauman\Purify\Facades\Purify;


class MessageRepository extends BaseRepository
{

    public function boot()
    {
        try {
            $this->pushCriteria(app(RequestCriteria::class));
        } catch (RepositoryException $e) {
        }
    }


    /**
     * Configure the Model
     **/
    public function model()
    {
        return Message::class;
    }

    /**
     * @param $request
     * @return LengthAwarePaginator|JsonResponse|Collection|mixed
     */
    public function storeMessage($request)
    {
        $type = '';
        $conversation_id = $request->conversation_id;
        try {
            $conversation = Conversation::findOrFail($conversation_id);
            $authorize = [
                'user' => false,
                'shop' => false
            ];
            if ($request->user()->id == $conversation->user_id) {
                $authorize['user'] = true;
                $type =  "shop";
            }
            if (
                in_array($conversation->shop_id, $request->user()->shops()->pluck('id')->toArray()) ||
                $conversation->shop_id === $request->user()->shop_id
            ) {
                $authorize['shop'] = true;
                $type =  "user";
            }
            if (false === $authorize['user'] && false === $authorize['shop']) {
                throw new oglabException(NOT_AUTHORIZED);
            }

            $message = $this->create([
                'body'              => $request->message,
                'conversation_id'   => $conversation_id,
                'user_id'           => $request->user()->id,
            ]);

            $message->conversation->update(['updated_at' => now()]);

            event(new MessageSent($message, $conversation, $type, $request->user()));

            return $message;
        } catch (\Exception $e) {
            throw new oglabException(NOT_AUTHORIZED);
        }
    }
}
