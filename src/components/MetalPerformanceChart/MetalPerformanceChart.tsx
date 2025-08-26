import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import './MetalPerformanceChart.css';

interface MetalPerformanceChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

const MetalPerformanceChart: React.FC<MetalPerformanceChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Group by metal and calculate performance
    const metalPerformance = completedTrades.reduce((acc, trade) => {
        if (!acc[trade.metal]) {
            acc[trade.metal] = { totalPL: 0, count: 0, accuracy: 0 };
        }
        acc[trade.metal].totalPL += trade.profitLoss;
        acc[trade.metal].count += 1;
        acc[trade.metal].accuracy += trade.accuracy;
        return acc;
    }, {} as Record<string, { totalPL: number; count: number; accuracy: number }>);

    const chartData = Object.entries(metalPerformance).map(([metal, data]) => ({
        metal,
        avgPL: data.totalPL / data.count,
        avgAccuracy: (data.accuracy / data.count) * 100,
        count: data.count
    }));

    const maxPL = Math.max(...chartData.map(d => Math.abs(d.avgPL)));
    const metalColors = {
        palladium: 'var(--color-primary-500)',
        copper: 'var(--color-warning-500)',
        gold: 'var(--color-accent-500)',
        silver: 'var(--color-text-secondary)',
        iron: 'var(--color-danger-500)'
    };

    return (
        <div className="metal_performance_chart_container" style={{ height }}>
            <div className="metal_performance_chart_header">
                <h3 className="metal_performance_chart_title">{title}</h3>
            </div>
            <div className="metal_performance_chart_content">
                <div className="metal_performance_bars">
                    {chartData.map((data) => (
                        <div key={data.metal} className="metal_performance_bar_group">
                            <div className="metal_performance_bar_container">
                                <div 
                                    className="metal_performance_bar"
                                    style={{
                                        height: `${(Math.abs(data.avgPL) / maxPL) * 80}%`,
                                        backgroundColor: metalColors[data.metal as keyof typeof metalColors],
                                    }}
                                    title={`${data.metal}: $${data.avgPL.toFixed(2)} avg P&L`}
                                >
                                    <span className="metal_performance_value">
                                        ${data.avgPL > 0 ? '+' : ''}${data.avgPL.toFixed(0)}
                                    </span>
                                </div>
                            </div>
                            <div className="metal_performance_label">
                                <span className="metal_performance_metal_name">
                                    {data.metal.charAt(0).toUpperCase() + data.metal.slice(1)}
                                </span>
                                <span className="metal_performance_accuracy">
                                    {data.avgAccuracy.toFixed(1)}% acc
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default MetalPerformanceChart;
