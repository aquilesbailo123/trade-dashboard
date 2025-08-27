import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import './RiskAdjustmentChart.css';
import '../../styles/chartRules.css';

interface RiskAdjustmentChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

const RiskAdjustmentChart: React.FC<RiskAdjustmentChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Create scatter plot data showing execution price vs risk price
    const scatterData = completedTrades.map(trade => ({
        executionPrice: trade.actualSalePrice,
        riskPrice: trade.estimatedPrice,
        metal: trade.metal,
        profitLoss: trade.profitLoss,
        id: trade.id,
        isWinning: trade.actualSalePrice >= trade.estimatedPrice
    }));

    if (scatterData.length === 0) {
        return (
            <div className="chart_container" style={{ height }}>
                <div className="chart_header">
                    <h3 className="chart_title">{title}</h3>
                </div>
                <div className="chart_no_data">No trade data available</div>
            </div>
        );
    }

    const maxPrice = Math.max(
        ...scatterData.map(d => Math.max(d.executionPrice, d.riskPrice))
    );
    const minPrice = Math.min(
        ...scatterData.map(d => Math.min(d.executionPrice, d.riskPrice))
    );

    const tradeColors = {
        winning: '#22c55e',
        losing: '#ef4444',
    };

    // Scale functions for positioning
    const scaleX = (price: number) => {
        return 20 + ((price - minPrice) / (maxPrice - minPrice)) * 560;
    };

    const scaleY = (price: number) => {
        return 180 - ((price - minPrice) / (maxPrice - minPrice)) * 160;
    };

    return (
        <div className="risk_adjustment_chart_container chart_container" style={{ height }}>
            <div className="risk_adjustment_chart_header chart_header">
                <h3 className="risk_adjustment_chart_title chart_title">{title}</h3>
                <div className="risk_adjustment_chart_legend chart_legend">
                    {Object.entries(tradeColors).map(([type, color]) => (
                        <span key={type} className="risk_adjustment_legend_item chart_legend_item">
                            <span 
                                className="risk_adjustment_legend_dot legend_dot" 
                                style={{ backgroundColor: color }}
                            ></span>
                            {type === 'winning' ? 'Profitable Trades' : 'Losing Trades'}
                        </span>
                    ))}
                </div>
            </div>
            <div className="risk_adjustment_chart_content chart_content">
                <div className="risk_adjustment_main_area">
                    <div className="risk_adjustment_y_axis chart_y_axis">
                        <span className="risk_adjustment_y_label chart_y_label">${maxPrice.toFixed(0)}</span>
                        <span className="risk_adjustment_y_label chart_y_label">${((maxPrice + minPrice) / 2).toFixed(0)}</span>
                        <span className="risk_adjustment_y_label chart_y_label">${minPrice.toFixed(0)}</span>
                    </div>
                    <div className="risk_adjustment_chart_area chart_area">
                        <svg className="risk_adjustment_svg chart_svg" viewBox="0 0 600 200">
                            {/* Grid lines */}
                            <g className="risk_adjustment_grid chart_grid">
                                <line x1="0" y1="20" x2="600" y2="20" className="grid_line"/>
                                <line x1="0" y1="100" x2="600" y2="100" className="grid_line"/>
                                <line x1="0" y1="180" x2="600" y2="180" className="major_line"/>
                            </g>

                            {/* Diagonal line separating winning/losing trades */}
                            <line 
                                x1={scaleX(minPrice)} 
                                y1={scaleY(minPrice)} 
                                x2={scaleX(maxPrice)} 
                                y2={scaleY(maxPrice)} 
                                stroke="#ef4444" 
                                strokeWidth="2" 
                                strokeDasharray="5,5"
                                opacity="0.8"
                            />

                            {/* Data points */}
                            {scatterData.map((d, i) => {
                                const x = scaleX(d.riskPrice);
                                const y = scaleY(d.executionPrice);
                                return (
                                    <circle
                                        key={i}
                                        cx={Math.max(20, Math.min(580, x))}
                                        cy={Math.max(20, Math.min(180, y))}
                                        r="4"
                                        fill={d.isWinning ? tradeColors.winning : tradeColors.losing}
                                        className="risk_adjustment_point chart_point"
                                        opacity="0.8"
                                        strokeWidth="2"
                                    >
                                        <title>
                                            {`${d.id} (${d.metal}): Risk Price: $${d.riskPrice.toFixed(2)}, Execution Price: $${d.executionPrice.toFixed(2)}, ${d.isWinning ? 'Winning' : 'Losing'} Trade`}
                                        </title>
                                    </circle>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="risk_adjustment_x_axis chart_x_axis">
                    <span className="risk_adjustment_x_label chart_x_label">${minPrice.toFixed(0)}</span>
                    <span className="risk_adjustment_x_label chart_x_label">Risk Price</span>
                    <span className="risk_adjustment_x_label chart_x_label">${maxPrice.toFixed(0)}</span>
                </div>
            </div>
        </div>
    );
};

export default RiskAdjustmentChart;
