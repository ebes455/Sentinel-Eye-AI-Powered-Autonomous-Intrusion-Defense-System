<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('threat_logs', function (Blueprint $table) {
            $table->id();
            $table->string('ip_address')->index();
            $table->string('geo_location')->nullable();
            $table->string('attack_signature');
            $table->string('attack_type')->index(); // port_scan, arp_spoof, sql_injection, xss_attempt
            $table->integer('risk_score'); // 1-100
            $table->text('ai_analysis')->nullable();
            $table->json('metadata')->nullable(); // Additional packet details
            $table->timestamps();
            
            // Index for quick querying recent threats
            $table->index('created_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('threat_logs');
    }
};
