import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import './AccuracyTrendChart.css';

interface AccuracyTrendChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

const AccuracyTrendChart: React.FC<AccuracyTrendChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Group trades by day and calculate daily accuracy
    const dailyAccuracy = completedTrades.reduce((acc, trade) => {
        const date = new Date(trade.timestamp).toLocaleDateString();
        if (!acc[date]) {
            acc[date] = { totalAccuracy: 0, count: 0 };
        }
        acc[date].totalAccuracy += trade.accuracy;
        acc[date].count += 1;
        return acc;
    }, {} as Record<string, { totalAccuracy: number; count: number }>);

    const chartData = Object.entries(dailyAccuracy)
        .map(([date, data]) => ({
            date,
            accuracy: (data.totalAccuracy / data.count) * 100,
            count: data.count
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

    const maxAccuracy = Math.max(...chartData.map(d => d.accuracy));
    const minAccuracy = Math.min(...chartData.map(d => d.accuracy));

    return (
        <div className="accuracy_trend_chart_container" style={{ height }}>
            <div className="accuracy_trend_chart_header">
                <h3 className="accuracy_trend_chart_title">{title}</h3>
                <div className="accuracy_trend_chart_legend">
                    <span className="accuracy_trend_legend_item">
                        <span className="accuracy_trend_legend_dot"></span>
                        Prediction Accuracy
                    </span>
                </div>
            </div>
            <div className="accuracy_trend_chart_content">
                <div className="accuracy_trend_y_axis">
                    <span className="accuracy_trend_y_label">{maxAccuracy.toFixed(0)}%</span>
                    <span className="accuracy_trend_y_label">{((maxAccuracy + minAccuracy) / 2).toFixed(0)}%</span>
                    <span className="accuracy_trend_y_label">{minAccuracy.toFixed(0)}%</span>
                </div>
                <div className="accuracy_trend_chart_area">
                    <svg className="accuracy_trend_svg" viewBox="0 0 400 200">
                        <defs>
                            <linearGradient id="accuracyGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.3"/>
                                <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0.1"/>
                            </linearGradient>
                        </defs>
                        
                        {/* Grid lines */}
                        <g className="accuracy_trend_grid">
                            <line x1="0" y1="50" x2="400" y2="50" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                            <line x1="0" y1="100" x2="400" y2="100" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                            <line x1="0" y1="150" x2="400" y2="150" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                        </g>

                        {/* Area path */}
                        <path
                            d={`M ${chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1)) * 400;
                                const y = 200 - ((d.accuracy - minAccuracy) / (maxAccuracy - minAccuracy)) * 200;
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')} L 400 200 L 0 200 Z`}
                            fill="url(#accuracyGradient)"
                        />

                        {/* Line path */}
                        <path
                            d={chartData.map((d, i) => {
                                const x = (i / (chartData.length - 1)) * 400;
                                const y = 200 - ((d.accuracy - minAccuracy) / (maxAccuracy - minAccuracy)) * 200;
                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                            }).join(' ')}
                            stroke="var(--color-primary-500)"
                            strokeWidth="2"
                            fill="none"
                        />

                        {/* Data points */}
                        {chartData.map((d, i) => {
                            const x = (i / (chartData.length - 1)) * 400;
                            const y = 200 - ((d.accuracy - minAccuracy) / (maxAccuracy - minAccuracy)) * 200;
                            return (
                                <circle
                                    key={i}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="var(--color-primary-500)"
                                    className="accuracy_trend_point"
                                >
                                    <title>{`${d.date}: ${d.accuracy.toFixed(1)}% (${d.count} trades)`}</title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>
                <div className="accuracy_trend_x_axis">
                    {chartData.map((d, i) => (
                        <span key={i} className="accuracy_trend_x_label">
                            {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AccuracyTrendChart;
