import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import '../../styles/chartRules.css';
import './ProfitLossChart.css';

interface ProfitLossChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

const ProfitLossChart: React.FC<ProfitLossChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Categorize trades based on execution vs risk price percentage difference
    const categories = completedTrades.reduce((acc, trade) => {
        const percentageDiff = ((trade.actualSalePrice - trade.riskPrice) / trade.riskPrice) * 100;
        
        if (isNaN(percentageDiff) || !isFinite(percentageDiff)) {
            return acc;
        }
        
        if (percentageDiff < 0) {
            acc.below.count += 1;
        } else if (percentageDiff < 10) {
            acc.lowAbove.count += 1;
        } else {
            acc.highAbove.count += 1;
        }
        
        return acc;
    }, {
        below: { count: 0, label: '<0%', description: 'Below Risk Price' },
        lowAbove: { count: 0, label: '<10%', description: '0-10% Above Risk' },
        highAbove: { count: 0, label: '≥10%', description: '10%+ Above Risk' }
    });

    const chartData = [
        { ...categories.below, color: 'var(--color-danger-500)' },
        { ...categories.lowAbove, color: 'var(--color-warning-500)' },
        { ...categories.highAbove, color: 'var(--color-success-500)' }
    ];

    const maxCount = Math.max(...chartData.map(d => d.count), 1);
    const totalTrades = completedTrades.length;

    return (
        <div className="profit_loss_chart_container chart_container" style={{ height }}>
            <div className="profit_loss_chart_header chart_header">
                <h3 className="profit_loss_chart_title chart_title">{title}</h3>
                <div className="profit_loss_chart_legend chart_legend">
                    <span className="profit_loss_legend_item chart_legend_item">
                        <span className="profit_loss_legend_bar" style={{ backgroundColor: 'var(--color-danger-500)' }}></span>
                        Below Risk
                    </span>
                    <span className="profit_loss_legend_item chart_legend_item">
                        <span className="profit_loss_legend_bar" style={{ backgroundColor: 'var(--color-warning-500)' }}></span>
                        0-10% Above
                    </span>
                    <span className="profit_loss_legend_item chart_legend_item">
                        <span className="profit_loss_legend_bar" style={{ backgroundColor: 'var(--color-success-500)' }}></span>
                        10%+ Above
                    </span>
                </div>
            </div>
            <div className="profit_loss_chart_content chart_content">
                <div className="profit_loss_main_area">
                    <div className="profit_loss_y_axis chart_y_axis">
                        <span className="profit_loss_y_label chart_y_label">{totalTrades > 0 ? ((maxCount / totalTrades) * 100).toFixed(0) : 0}%</span>
                        <span className="profit_loss_y_label chart_y_label">{totalTrades > 0 ? ((Math.floor(maxCount / 2) / totalTrades) * 100).toFixed(0) : 0}%</span>
                        <span className="profit_loss_y_label chart_y_label">0%</span>
                    </div>
                    <div className="profit_loss_chart_area chart_area">
                        <svg className="profit_loss_svg chart_svg" viewBox="0 0 600 200">
                            {/* Grid lines */}
                            <g className="profit_loss_grid chart_grid">
                                <line x1="20" y1="20" x2="580" y2="20" className="grid_line"/>
                                <line x1="20" y1="110" x2="580" y2="110" className="grid_line"/>
                                <line x1="20" y1="180" x2="580" y2="180" className="major_line"/>
                            </g>

                            {/* Bars */}
                            {chartData.map((data, index) => {
                                const chartWidth = 530; // 580 - 50 (left margin for y-axis)
                                const chartHeight = 140; // 180 - 20 (top) - 20 (bottom)
                                const barSpacing = chartWidth / 3; // ~177px per section
                                const barWidth = 120;
                                const x = 50 + (index + 0.5) * barSpacing;
                                const barHeight = (data.count / maxCount) * chartHeight; 
                                const y = 180 - barHeight;
                                
                                return (
                                    <g key={index}>
                                        <rect
                                            x={x - barWidth / 2}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={data.color}
                                            className="chart_bar"
                                            opacity="0.8"
                                        >
                                            <title>{`${data.description}: ${data.count} trades`}</title>
                                        </rect>
                                        <text
                                            x={x}
                                            y={y - 8}
                                            textAnchor="middle"
                                            fontSize="12"
                                            fill="var(--color-text-primary)"
                                            fontWeight="600"
                                        >
                                            {data.count}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="profit_loss_x_axis chart_x_axis">
                    {chartData.map((data, index) => {
                        const chartAreaWidth = 90; // Percentage of available width after margin
                        const barSpacing = chartAreaWidth / 3;
                        const position = `${5 + (index + 0.5) * barSpacing}%`;
                        return (
                            <span 
                                key={index} 
                                className="profit_loss_x_label chart_x_label"
                                style={{ position: 'absolute', left: position, transform: 'translateX(-50%)' }}
                            >
                                {data.label}
                            </span>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ProfitLossChart;
