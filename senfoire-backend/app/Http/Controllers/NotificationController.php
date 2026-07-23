<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request)
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->get();

        return response()->json([
            'success' => true,
            'data' => $notifications,
        ], 200);
    }

    public function unreadCount(Request $request)
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('lu', false)
            ->count();

        return response()->json([
            'success' => true,
            'count' => $count,
        ], 200);
    }

    public function markAsRead($id)
    {
        $notification = Notification::find($id);

        if (!$notification) {
            return response()->json(['success' => false, 'message' => 'Notification introuvable.'], 404);
        }

        $notification->update(['lu' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Notification marquée comme lue.',
        ], 200);
    }

    public function markAllAsRead(Request $request)
    {
        Notification::where('user_id', $request->user()->id)
            ->where('lu', false)
            ->update(['lu' => true]);

        return response()->json([
            'success' => true,
            'message' => 'Toutes les notifications marquées comme lues.',
        ], 200);
    }
}
