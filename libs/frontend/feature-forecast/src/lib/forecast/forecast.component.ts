import { Component, computed, effect, inject } from '@angular/core';
import { DashboardService } from '@hiko/frontend-feature-dashboard';
import { ForecastService } from './forecast.service';
import { BaseChartDirective } from 'ng2-charts';
import {
  Chart,
  ChartConfiguration,
  ChartType,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { DecimalPipe } from '@angular/common';

// Register Chart.js components
Chart.register(CategoryScale, LinearScale, BarElement, BarController, Title, Tooltip, Legend);

@Component({
  selector: 'lib-forecast',
  imports: [BaseChartDirective, DecimalPipe],
  templateUrl: './forecast.component.html',
  styleUrl: './forecast.component.scss',
})
export class ForecastComponent {
  private dashboardService = inject(DashboardService);
  private forecastService = inject(ForecastService);

  readonly forecastData = this.forecastService.forecastData;

  readonly chartType: ChartType = 'bar';
  readonly hourLabels = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}`);

  // computed signal for chart data
  readonly chartData = computed<ChartConfiguration['data']>(() => {
    const forecast = this.forecastData();
    if (!forecast?.powerValues || forecast.powerValues.length === 0) {
      return {
        labels: this.hourLabels,
        datasets: [
          {
            data: Array(24).fill(0),
            backgroundColor: '#1976d2',
            borderColor: '#1565c0',
            borderWidth: 1,
            label: 'Prognose',
          },
        ],
      };
    }

    const hourlyValues = forecast.powerValues.slice(1, 25).map((pv) => pv.value);

    return {
      labels: this.hourLabels,
      datasets: [
        {
          data: hourlyValues,
          backgroundColor: '#1976d2',
          borderColor: '#1565c0',
          borderWidth: 1,
          label: 'Prognose',
        },
      ],
    };
  });

  readonly chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context) => `${context.parsed.y.toFixed(1)} kW`,
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#1976d2',
          maxRotation: 45,
          minRotation: 0,
          autoSkip: true,
          maxTicksLimit: 12,
          font: {
            size: 18,
          },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.10)',
        },
        title: {
          color: '#1976d2',
          display: true,
          text: 'Leistung (kW)',
          font: {
            size: 18,
          },
        },
        ticks: {
          color: '#1976d2',
          font: {
            size: 18,
          },
        },
      },
    },
  };

  readonly totalProduction = computed(() => {
    const forecast = this.forecastData();
    if (!forecast?.powerValues || forecast.powerValues.length === 0) {
      return 0;
    }

    // Sum up all values except the first one (skip previous day's last hour)
    return forecast.powerValues.slice(1, 25).reduce((sum, pv) => sum + pv.value, 0);
  });

  constructor() {
    effect(() => {
      const refreshEvent = this.dashboardService.currentRefreshRoute();
      if (refreshEvent?.route === 'forecast') {
        this.refresh();
      }
    });
  }

  refresh(): void {
    this.forecastService.refresh();
  }
}
