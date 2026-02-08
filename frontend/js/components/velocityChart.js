/**
 * Velocity Chart Component
 * Real-time line chart showing attacks per minute using Chart.js
 */

export class VelocityChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.chart = null;
        this.dataPoints = [];
        this.maxDataPoints = 60; // Last 60 time periods
        this.init();
    }

    /**
     * Initialize Chart.js chart
     */
    init() {
        const ctx = this.canvas.getContext('2d');

        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Attacks/Min',
                    data: [],
                    borderColor: '#22c55e',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: 2,
                    pointRadius: 0,
                    pointHoverRadius: 4,
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                aspectRatio: 2,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    x: {
                        display: true,
                        grid: {
                            color: 'rgba(34, 197, 94, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: 'Fira Code'
                            },
                            maxRotation: 0,
                            maxTicksLimit: 10
                        }
                    },
                    y: {
                        display: true,
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(34, 197, 94, 0.1)'
                        },
                        ticks: {
                            color: '#6b7280',
                            font: {
                                family: 'Fira Code'
                            },
                            precision: 0
                        }
                    }
                },
                animation: {
                    duration: 300
                }
            }
        });

        console.log('📊 Velocity chart initialized');
    }

    /**
     * Add new threat to chart
     */
    addThreat(threat) {
        const currentMinute = this.getCurrentMinute();

        // Find if we already have a data point for this minute
        let dataPoint = this.dataPoints.find(dp => dp.time === currentMinute);

        if (dataPoint) {
            dataPoint.count++;
        } else {
            dataPoint = { time: currentMinute, count: 1 };
            this.dataPoints.push(dataPoint);
        }

        // Keep only last N data points
        if (this.dataPoints.length > this.maxDataPoints) {
            this.dataPoints.shift();
        }

        // Update chart
        this.updateChart();
    }

    /**
     * Update chart from API stats (periodic refresh)
     */
    updateFromStats(velocityData) {
        if (!velocityData || !Array.isArray(velocityData)) {
            return;
        }

        // Convert API data to chart format
        this.dataPoints = velocityData.map(item => ({
            time: this.formatMinute(item.minute),
            count: item.count
        }));

        this.updateChart();
    }

    /**
     * Update chart display
     */
    updateChart() {
        // Prepare labels and data
        const labels = this.dataPoints.map(dp => dp.time);
        const data = this.dataPoints.map(dp => dp.count);

        // Update chart
        this.chart.data.labels = labels;
        this.chart.data.datasets[0].data = data;
        this.chart.update();
    }

    /**
     * Get current minute as formatted string
     */
    getCurrentMinute() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }

    /**
     * Format minute from timestamp
     */
    formatMinute(timestamp) {
        const date = new Date(timestamp);
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
}
