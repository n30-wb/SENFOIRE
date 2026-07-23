<?php

namespace App\Services;

use App\Models\PushSubscription;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;

class NotificationService
{
    /**
     * Send a push notification to a specific user
     */
    public static function sendPushNotification(int $userId, string $title, string $body, array $data = []): void
    {
        // Also create in-app notification
        Notification::create([
            'user_id' => $userId,
            'type' => $data['type'] ?? 'info',
            'message' => $body,
        ]);

        // Get user's push subscriptions
        $subscriptions = PushSubscription::where('user_id', $userId)->get();

        if ($subscriptions->isEmpty()) {
            return;
        }

        $fcmKey = config('services.fcm.server_key');
        if (!$fcmKey) {
            return; // FCM not configured
        }

        foreach ($subscriptions as $subscription) {
            $message = [
                'to' => $subscription->endpoint,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'icon' => '/icons/icon-192x192.png',
                    'badge' => '/icons/icon-192x192.png',
                ],
                'data' => array_merge($data, [
                    'url' => '/',
                ]),
                'webpush' => [
                    'headers' => [
                        'Urgency' => 'high',
                    ],
                    'fcm_options' => [
                        'link' => '/',
                    ],
                ],
            ];

            self::sendToEndpoint($subscription->endpoint, $fcmKey, $message);
        }
    }

    /**
     * Send push notification to multiple users
     */
    public static function sendBulkPushNotification(array $userIds, string $title, string $body, array $data = []): void
    {
        foreach ($userIds as $userId) {
            self::sendPushNotification($userId, $title, $body, $data);
        }
    }

    /**
     * Send notification to all users with a specific role
     */
    public static function sendToRole(string $role, string $title, string $body, array $data = []): void
    {
        $userIds = \App\Models\User::where('role', $role)->pluck('id')->toArray();
        self::sendBulkPushNotification($userIds, $title, $body, $data);
    }

    /**
     * Send raw request to FCM endpoint
     */
    private static function sendToEndpoint(string $endpoint, string $serverKey, array $message): void
    {
        try {
            $ch = curl_init();
            curl_setopt_array($ch, [
                CURLOPT_URL => 'https://fcm.googleapis.com/fcm/send',
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => [
                    'Authorization: key=' . $serverKey,
                    'Content-Type: application/json',
                ],
                CURLOPT_POSTFIELDS => json_encode($message),
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_TIMEOUT => 10,
            ]);
            curl_exec($ch);
            curl_close($ch);
        } catch (\Exception $e) {
            Log::error('FCM push notification failed: ' . $e->getMessage());
        }
    }
}
