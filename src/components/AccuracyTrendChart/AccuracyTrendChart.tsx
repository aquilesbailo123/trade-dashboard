import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import '../../styles/chartRules.css';
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
    
    // Group trades by day and calculate daily percentage difference
    const dailyPriceDifference = completedTrades.reduce((acc, trade) => {
        const tradeDate = new Date(trade.timestamp);
        const date = tradeDate.toISOString().split('T')[0]; // Use YYYY-MM-DD format
        if (!acc[date]) {
            acc[date] = { totalDifference: 0, count: 0 };
        }
        // Calculate percentage difference between execution price and risk price
        const percentageDiff = ((trade.actualSalePrice - trade.riskPrice) / trade.riskPrice) * 100;
        if (!isNaN(percentageDiff) && isFinite(percentageDiff)) {
            acc[date].totalDifference += percentageDiff;
            acc[date].count += 1;
        }
        return acc;
    }, {} as Record<string, { totalDifference: number; count: number }>);

    const chartData = Object.entries(dailyPriceDifference)
        .map(([date, data]) => ({
            date,
            avgDifference: data.count > 0 ? data.totalDifference / data.count : 0,
            count: data.count
        }))
        .filter(d => d.count > 0)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .slice(-14); // Last 14 days

    const maxDifference = Math.max(...chartData.map(d => Math.abs(d.avgDifference)), 1);

    return (
        <div className="accuracy_trend_chart_container chart_container" style={{ height }}>
            <div className="accuracy_trend_chart_header chart_header">
                <h3 className="accuracy_trend_chart_title chart_title">{title}</h3>
                <div className="accuracy_trend_chart_legend chart_legend">
                    <span className="accuracy_trend_legend_item chart_legend_item">
                        <span className="accuracy_trend_legend_dot chart_legend_dot"></span>
                        Price Difference Trend
                    </span>
                </div>
            </div>
            <div className="accuracy_trend_chart_content chart_content">
                <div className="accuracy_trend_main_area">
                    <div className="accuracy_trend_y_axis chart_y_axis">
                        <span className="accuracy_trend_y_label chart_y_label">+{maxDifference.toFixed(1)}%</span>
                        <span className="accuracy_trend_y_label chart_y_label">0%</span>
                        <span className="accuracy_trend_y_label chart_y_label">-{maxDifference.toFixed(1)}%</span>
                    </div>
                    <div className="accuracy_trend_chart_area chart_area">
                        <svg className="accuracy_trend_svg chart_svg" viewBox="0 0 600 200">
                            <defs>
                                <linearGradient id="priceDifferenceTrendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                    <stop offset="0%" stopColor="var(--color-primary-500)" stopOpacity="0.3"/>
                                    <stop offset="100%" stopColor="var(--color-primary-500)" stopOpacity="0.1"/>
                                </linearGradient>
                            </defs>
                            
                            {/* Grid lines */}
                            <g className="accuracy_trend_grid chart_grid">
                                <line x1="20" y1="20" x2="580" y2="20" className="grid_line"/>
                                <line x1="20" y1="100" x2="580" y2="100" className="major_line"/>
                                <line x1="20" y1="180" x2="580" y2="180" className="grid_line"/>
                            </g>

                            {/* Zero line - horizontal line at 0% */}
                            <line 
                                x1="20" 
                                y1="100" 
                                x2="580" 
                                y2="100" 
                                stroke="var(--color-text-secondary)" 
                                strokeWidth="2" 
                                strokeDasharray="5,5"
                                opacity="0.8"
                            />

                            {/* Area path */}
                            {chartData.length > 0 && (
                                <path
                                    d={`M ${chartData.map((d, i) => {
                                        const x = chartData.length === 1 ? 300 : 20 + (i / (chartData.length - 1)) * 560;
                                        const y = 100 - (d.avgDifference / maxDifference) * 80;
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(20, Math.min(180, y))}`;
                                    }).join(' ')} L 580 100 L 20 100 Z`}
                                    fill="url(#priceDifferenceTrendGradient)"
                                />
                            )}

                            {/* Line path */}
                            {chartData.length > 0 && (
                                <path
                                    d={chartData.map((d, i) => {
                                        const x = chartData.length === 1 ? 300 : 20 + (i / (chartData.length - 1)) * 560;
                                        const y = 100 - (d.avgDifference / maxDifference) * 80;
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(20, Math.min(180, y))}`;
                                    }).join(' ')}
                                    stroke="var(--color-primary-500)"
                                    strokeWidth="2"
                                    fill="none"
                                />
                            )}

                            {/* Data points */}
                            {chartData.map((d, i) => {
                                const x = chartData.length === 1 ? 300 : 20 + (i / (chartData.length - 1)) * 560;
                                const y = 100 - (d.avgDifference / maxDifference) * 80;
                                const clampedY = Math.max(20, Math.min(180, y));
                                return (
                                    <circle
                                        key={i}
                                        cx={x}
                                        cy={clampedY}
                                        r="4"
                                        fill="var(--color-primary-500)"
                                        className="accuracy_trend_point chart_point"
                                    >
                                        <title>{`${d.date}: ${d.avgDifference.toFixed(2)}% avg difference (${d.count} trades)`}</title>
                                    </circle>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="accuracy_trend_x_axis chart_x_axis">
                    {chartData.length > 0 && chartData.map((d, i) => {
                        const displayDate = new Date(d.date + 'T00:00:00'); // Add time to ensure proper parsing
                        const position = chartData.length === 1 ? '50%' : `${5 + (i / (chartData.length - 1)) * 90}%`;
                        return (
                            <span 
                                key={i} 
                                className="accuracy_trend_x_label chart_x_label"
                                style={{ position: 'absolute', left: position, transform: 'translateX(-50%)' }}
                            >
                                {displayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AccuracyTrendChart;
