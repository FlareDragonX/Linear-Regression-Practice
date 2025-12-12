// State
let w0 = 0;
let w1 = 1;
let dataPoints = [];
let chart = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    generateNewProblem();
    initializeSliders();
    initializeButtons();
    renderChart();
});

// Generate random data points
function generateNewProblem() {
    dataPoints = [];
    const numPoints = 30;
    
    for (let i = 0; i < numPoints; i++) {
        const x = (Math.random() * 11.2) - 5.5; // Range: -5.5 to 5.7
        const trueSlope = (Math.random() * 2) - 1; // True slope between -1 and 1
        const trueIntercept = (Math.random() * 2) - 1; // True intercept between -1 and 1
        const noise = (Math.random() * 2) - 1; // Random noise
        const y = trueIntercept + trueSlope * x + noise;
        
        dataPoints.push({ x, y });
    }
    
    // Reset weights to initial values
    w0 = 0;
    w1 = 1;
    document.getElementById('w0').value = w0;
    document.getElementById('w1').value = w1;
    updateWeightDisplays();
    
    if (chart) {
        renderChart();
    }
}

// Initialize slider event listeners
function initializeSliders() {
    const w0Slider = document.getElementById('w0');
    const w1Slider = document.getElementById('w1');
    
    w0Slider.addEventListener('input', (e) => {
        w0 = parseFloat(e.target.value);
        updateWeightDisplays();
        updateChart();
    });
    
    w1Slider.addEventListener('input', (e) => {
        w1 = parseFloat(e.target.value);
        updateWeightDisplays();
        updateChart();
    });
}

// Update weight displays
function updateWeightDisplays() {
    document.getElementById('w0-value').textContent = w0.toFixed(2);
    document.getElementById('w1-value').textContent = w1.toFixed(2);
}

// Initialize buttons
function initializeButtons() {
    document.getElementById('new-problem-btn').addEventListener('click', () => {
        generateNewProblem();
        renderChart();
    });
    
    document.getElementById('download-csv-btn').addEventListener('click', downloadCSV);
}

// Calculate MSE
function calculateMSE() {
    if (dataPoints.length === 0) return 0;
    
    let sumSquaredErrors = 0;
    
    for (const point of dataPoints) {
        const predicted = w0 + w1 * point.x;
        const error = point.y - predicted;
        sumSquaredErrors += error * error;
    }
    
    return sumSquaredErrors / dataPoints.length;
}

// Update MSE display
function updateMSEDisplay() {
    const mse = calculateMSE();
    document.getElementById('mse-value').textContent = mse.toFixed(3);
}

// Render chart
function renderChart() {
    const ctx = document.getElementById('chart').getContext('2d');
    
    // Calculate line points for the model
    const xValues = [];
    const yValuesModel = [];
    
    for (let x = -6; x <= 6.5; x += 0.5) {
        xValues.push(x);
        yValuesModel.push(w0 + w1 * x);
    }
    
    // Prepare data points
    const dataPointsForChart = dataPoints.map(p => ({
        x: p.x,
        y: p.y
    }));
    
    const chartConfig = {
        type: 'scatter',
        data: {
            datasets: [
                {
                    label: 'Data',
                    data: dataPointsForChart,
                    backgroundColor: '#2563eb',
                    borderColor: '#2563eb',
                    radius: 5,
                    order: 1
                },
                {
                    label: 'Model',
                    type: 'line',
                    data: xValues.map((x, i) => ({
                        x: x,
                        y: yValuesModel[i]
                    })),
                    borderColor: '#ef4444',
                    backgroundColor: 'transparent',
                    borderWidth: 2,
                    radius: 0,
                    pointRadius: 0,
                    tension: 0,
                    order: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: { size: 12 },
                        padding: 15
                    }
                },
                tooltip: {
                    enabled: true
                }
            },
            scales: {
                x: {
                    type: 'linear',
                    position: 'bottom',
                    min: -6,
                    max: 6.5,
                    ticks: {
                        stepSize: 2
                    },
                    grid: {
                        display: true,
                        color: '#e5e7eb'
                    }
                },
                y: {
                    min: -7,
                    max: -0.5,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        display: true,
                        color: '#e5e7eb'
                    }
                }
            }
        }
    };
    
    if (chart) {
        chart.destroy();
    }
    
    chart = new Chart(ctx, chartConfig);
    updateMSEDisplay();
}

// Update chart (refresh without destroying)
function updateChart() {
    if (chart) {
        // Calculate new line points
        const xValues = [];
        const yValuesModel = [];
        
        for (let x = -6; x <= 6.5; x += 0.5) {
            xValues.push(x);
            yValuesModel.push(w0 + w1 * x);
        }
        
        // Update model line
        chart.data.datasets[1].data = xValues.map((x, i) => ({
            x: x,
            y: yValuesModel[i]
        }));
        
        chart.update();
        updateMSEDisplay();
    }
}

// Download CSV
function downloadCSV() {
    if (dataPoints.length === 0) {
        alert('No data to download');
        return;
    }
    
    // Create CSV content
    let csv = 'x,y\n';
    for (const point of dataPoints) {
        csv += `${point.x.toFixed(4)},${point.y.toFixed(4)}\n`;
    }
    
    // Create blob and download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'linear-regression-data.csv';
    link.click();
    window.URL.revokeObjectURL(url);
}
