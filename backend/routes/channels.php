<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
*/

// Public channel for threat monitoring (no authentication required for demo)
Broadcast::channel('threats', function () {
    return true; // Allow all connections for hackathon demo
});
