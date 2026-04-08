import { colors, alpha } from '../utils/theme.js';
import { openDrawer } from './modals.js';

const charts = {};

function showSkeleton(containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const parent = el.parentElement;
  const skeleton = document.createElement('div');
  skeleton.className = 'skeleton';
  skeleton.id = containerId + '_skeleton';
  skeleton.style.cssText = `height:${el.style.height || el.offsetHeight || 220}px;border-radius:8px;`;
  el.style.display = 'none';
  parent.insertBefore(skeleton, el);
}

function hideSkeleton(containerId) {
  const skeleton = document.getElementById(containerId + '_skeleton');
  if (skeleton) skeleton.remove();
  const el = document.getElementById(containerId);
  if (el) el.style.display = '';
}

export async function initCharts(populationData, surveillanceData, socialData) {
  initPopulationCharts(populationData);
  initSurveillanceCharts(surveillanceData);
  initSocialCharts(socialData);
}

export async function initPopulationCharts(data) {
  if (!data) return;

  showSkeleton('chartTrends');
  showSkeleton('chartRisk');
  showSkeleton('chartDisease');

  await new Promise(r => setTimeout(r, 400));

  hideSkeleton('chartTrends');
  hideSkeleton('chartRisk');
  hideSkeleton('chartDisease');

  const trendsCtx = document.getElementById('chartTrends');
  if (trendsCtx && !charts.trends) {
    const labels = [...(data.trends?.labels || [])];
    const forecastLabels = [...labels, 'May*', 'Jun*'];
    const highRisk = [...(data.trends?.highRisk || [])];
    const forecastBase = highRisk[highRisk.length - 1] || 48200;
    const forecastData = [...Array(highRisk.length - 1).fill(null), highRisk[highRisk.length - 1], forecastBase + 1100, forecastBase + 2400];

    charts.trends = new Chart(trendsCtx, {
      type: 'line',
      data: {
        labels: forecastLabels,
        datasets: [
          {
            label: 'High-Risk Individuals',
            data: [...highRisk, null, null],
            borderColor: colors.red,
            backgroundColor: alpha(colors.red, 0.1),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'Active in Programs',
            data: [...(data.trends?.activePrograms || []), null, null],
            borderColor: colors.blue,
            backgroundColor: alpha(colors.blue, 0.08),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3
          },
          {
            label: 'Vaccination % (right axis)',
            data: [...(data.trends?.vaccinationCoverage || []), null, null],
            borderColor: colors.green,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            yAxisID: 'y2'
          },
          {
            label: 'AI Forecast (High-Risk)',
            data: forecastData,
            borderColor: colors.red,
            borderDash: [6, 4],
            borderWidth: 2,
            borderDashOffset: 0,
            fill: false,
            tension: 0.4,
            pointRadius: 0,
            segment: { borderDash: [6, 4] }
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true } }
        },
        scales: {
          y: { title: { display: true, text: 'Population Count', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
          y2: { position: 'right', title: { display: true, text: 'Coverage %', font: { size: 11 } }, min: 60, max: 100, grid: { display: false } },
          x: { grid: { color: '#f0f0f0' } }
        }
      }
    });
  }

  const riskCtx = document.getElementById('chartRisk');
  if (riskCtx && !charts.risk && data.risk) {
    charts.risk = new Chart(riskCtx, {
      type: 'doughnut',
      data: {
        labels: ['Very High', 'High', 'Moderate', 'Low', 'Healthy'],
        datasets: [{
          data: [
            data.risk.veryHigh,
            data.risk.high,
            data.risk.moderate,
            data.risk.low,
            data.risk.healthy
          ],
          backgroundColor: [colors.red, colors.amber, '#F7CB73', colors.teal, colors.green],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: { position: 'right', labels: { font: { size: 11 }, usePointStyle: true } },
          tooltip: {
            callbacks: {
              label: ctx => {
                const val = ctx.parsed;
                const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                const pct = ((val / total) * 100).toFixed(1);
                return ` ${ctx.label}: ${val.toLocaleString()} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }

  const diseaseCtx = document.getElementById('chartDisease');
  if (diseaseCtx && !charts.disease && data.chronic) {
    charts.disease = new Chart(diseaseCtx, {
      type: 'bar',
      data: {
        labels: data.chronic.districts,
        datasets: [
          { label: 'Diabetes %', data: data.chronic.diabetes, backgroundColor: alpha(colors.blue, 0.8) },
          { label: 'Hypertension %', data: data.chronic.hypertension, backgroundColor: alpha(colors.red, 0.8) },
          { label: 'Obesity %', data: data.chronic.obesity, backgroundColor: alpha(colors.amber, 0.8) },
          { label: 'Mental Health %', data: data.chronic.mentalHealth, backgroundColor: alpha(colors.purple, 0.8) }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, title: { display: true, text: 'Prevalence %', font: { size: 11 } }, grid: { color: '#f0f0f0' } }
        },
        onClick: (evt, elements) => {
          if (elements.length > 0) {
            const districtIndex = elements[0].index;
            const district = data.chronic.districts[districtIndex];
            openDistrictDrillDown(district, data.chronic, districtIndex);
          }
        }
      }
    });
  }
}

function openDistrictDrillDown(district, chronic, idx) {
  const ageGroups = ['18–34', '35–49', '50–64', '65–74', '75+'];
  const multipliers = [0.5, 0.8, 1.2, 1.6, 2.0];

  const content = `
    <p style="font-size:13px;color:var(--text-secondary);margin-bottom:16px">
      Chronic disease prevalence breakdown for <strong>${district} District</strong> by age group and gender.
    </p>
    <div style="height:220px;margin-bottom:20px"><canvas id="drillDownChart"></canvas></div>
    <div class="grid-2" style="margin-top:8px">
      <div style="background:var(--bg-primary);padding:12px;border-radius:8px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Diabetes</div>
        <div style="font-size:20px;font-weight:800;color:var(--ms-blue)">${chronic.diabetes[idx]}%</div>
      </div>
      <div style="background:var(--bg-primary);padding:12px;border-radius:8px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Hypertension</div>
        <div style="font-size:20px;font-weight:800;color:var(--ms-red)">${chronic.hypertension[idx]}%</div>
      </div>
      <div style="background:var(--bg-primary);padding:12px;border-radius:8px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Obesity</div>
        <div style="font-size:20px;font-weight:800;color:var(--ms-amber)">${chronic.obesity[idx]}%</div>
      </div>
      <div style="background:var(--bg-primary);padding:12px;border-radius:8px">
        <div style="font-size:12px;color:var(--text-muted);margin-bottom:4px">Mental Health</div>
        <div style="font-size:20px;font-weight:800;color:var(--ms-purple)">${chronic.mentalHealth[idx]}%</div>
      </div>
    </div>
  `;

  openDrawer({ title: `${district} District — Chronic Disease Drill-Down`, content });

  requestAnimationFrame(() => {
    const ctx = document.getElementById('drillDownChart');
    if (ctx) {
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: ageGroups,
          datasets: [
            { label: 'Male', data: multipliers.map(m => +(chronic.diabetes[idx] * m * 0.95).toFixed(1)), backgroundColor: alpha(colors.blue, 0.7) },
            { label: 'Female', data: multipliers.map(m => +(chronic.diabetes[idx] * m * 1.05).toFixed(1)), backgroundColor: alpha(colors.teal, 0.7) }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'top', labels: { font: { size: 11 } } } },
          scales: {
            x: { grid: { display: false } },
            y: { title: { display: true, text: 'Diabetes % by age & gender', font: { size: 10 } }, grid: { color: '#f0f0f0' } }
          }
        }
      });
    }
  });
}

export async function initSurveillanceCharts(data) {
  if (!data) return;

  showSkeleton('chartSurveillance');
  await new Promise(r => setTimeout(r, 350));
  hideSkeleton('chartSurveillance');

  const survCtx = document.getElementById('chartSurveillance');
  if (survCtx && !charts.surveillance && data.timeSeries) {
    const ts = data.timeSeries;
    charts.surveillance = new Chart(survCtx, {
      type: 'line',
      data: {
        labels: ts.labels,
        datasets: [
          {
            label: 'ILI Cases',
            data: ts.ili,
            borderColor: colors.red,
            backgroundColor: alpha(colors.red, 0.12),
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Respiratory Cases',
            data: ts.respiratory,
            borderColor: colors.amber,
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            yAxisID: 'y'
          },
          {
            label: 'Wastewater Signal',
            data: ts.wastewater,
            borderColor: colors.teal,
            borderWidth: 2,
            borderDash: [4, 3],
            fill: false,
            tension: 0.4,
            yAxisID: 'y2'
          },
          {
            label: 'Alert Baseline',
            data: ts.baseline,
            borderColor: colors.muted,
            borderWidth: 1,
            borderDash: [8, 4],
            fill: false,
            pointRadius: 0,
            yAxisID: 'y'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true } }
        },
        scales: {
          y: { title: { display: true, text: 'Case Count', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
          y2: { position: 'right', title: { display: true, text: 'Copies/mL', font: { size: 11 } }, grid: { display: false } },
          x: { grid: { color: '#f0f0f0' } }
        }
      }
    });
  }
}

export async function initSocialCharts(data) {
  if (!data) return;

  showSkeleton('chartCaseVolume');
  showSkeleton('chartCapacity');
  await new Promise(r => setTimeout(r, 300));
  hideSkeleton('chartCaseVolume');
  hideSkeleton('chartCapacity');

  const caseVolumeCtx = document.getElementById('chartCaseVolume');
  if (caseVolumeCtx && !charts.caseVolume && data.caseVolume) {
    const cv = data.caseVolume;
    const programColors = [colors.blue, colors.teal, colors.green, colors.amber, colors.purple];
    const programs = Object.keys(cv.programs);

    charts.caseVolume = new Chart(caseVolumeCtx, {
      type: 'bar',
      data: {
        labels: cv.labels,
        datasets: programs.map((prog, i) => ({
          label: prog,
          data: cv.programs[prog],
          backgroundColor: alpha(programColors[i % programColors.length], 0.8)
        }))
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { font: { size: 11 }, usePointStyle: true } }
        },
        scales: {
          x: { stacked: true, grid: { display: false } },
          y: { stacked: true, title: { display: true, text: 'Cases', font: { size: 11 } }, grid: { color: '#f0f0f0' } }
        }
      }
    });
  }

  const capacityCtx = document.getElementById('chartCapacity');
  if (capacityCtx && !charts.capacity && data.capacity) {
    const cap = data.capacity;
    charts.capacity = new Chart(capacityCtx, {
      type: 'bar',
      data: {
        labels: cap.districts,
        datasets: [
          {
            label: 'Assigned %',
            data: cap.assigned,
            backgroundColor: cap.assigned.map(v => alpha(v >= 90 ? colors.red : v >= 80 ? colors.amber : colors.green, 0.8)),
            borderRadius: 4
          }
        ]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false }
        },
        scales: {
          x: { max: 100, title: { display: true, text: 'Capacity Utilisation %', font: { size: 11 } }, grid: { color: '#f0f0f0' } },
          y: { grid: { display: false } }
        }
      }
    });
  }
}

export function updateCharts(populationData, surveillanceData, socialData) {
  if (charts.trends && populationData?.trends) {
    const t = populationData.trends;
    charts.trends.data.datasets[0].data = [...t.highRisk, null, null];
    charts.trends.data.datasets[1].data = [...t.activePrograms, null, null];
    charts.trends.data.datasets[2].data = [...t.vaccinationCoverage, null, null];
    charts.trends.update('active');
  }

  if (charts.risk && populationData?.risk) {
    const r = populationData.risk;
    charts.risk.data.datasets[0].data = [r.veryHigh, r.high, r.moderate, r.low, r.healthy];
    charts.risk.update('active');
  }

  if (charts.surveillance && surveillanceData?.timeSeries) {
    const ts = surveillanceData.timeSeries;
    charts.surveillance.data.datasets[0].data = ts.ili;
    charts.surveillance.data.datasets[1].data = ts.respiratory;
    charts.surveillance.data.datasets[2].data = ts.wastewater;
    charts.surveillance.update('active');
  }
}

export function renderOutbreakTrajectoryChart(canvasId, outbreak) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      datasets: [{
        label: outbreak.disease,
        data: outbreak.trajectory30d,
        borderColor: outbreak.status === 'critical' ? colors.red : colors.amber,
        backgroundColor: alpha(outbreak.status === 'critical' ? colors.red : colors.amber, 0.1),
        borderWidth: 2,
        fill: true,
        tension: 0.3,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { grid: { display: false }, ticks: { maxTicksLimit: 6 } },
        y: { title: { display: true, text: 'Cases', font: { size: 10 } }, grid: { color: '#f0f0f0' } }
      }
    }
  });
}
