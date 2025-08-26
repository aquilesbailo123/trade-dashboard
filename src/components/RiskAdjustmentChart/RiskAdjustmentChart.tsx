import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import './RiskAdjustmentChart.css';

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
    
    // Create scatter plot data showing risk adjustment vs actual performance
    const scatterData = completedTrades.map(trade => ({
        riskAdjustment: trade.riskAdjustment,
        actualDifference: trade.actualSalePrice - trade.estimatedPrice,
        metal: trade.metal,
        profitLoss: trade.profitLoss,
        id: trade.id
    }));

    const maxRisk = Math.max(...scatterData.map(d => Math.abs(d.riskAdjustment)));
    const maxActual = Math.max(...scatterData.map(d => Math.abs(d.actualDifference)));

    const metalColors = {
        alloy: 'var(--color-primary-500)',
        copper: 'var(--color-warning-500)',
        cobalt: 'var(--color-accent-500)',
        aluminium: 'var(--color-text-secondary)',
        nickel: 'var(--color-danger-500)',
        zinc: 'var(--color-primary-400)',
    };

    return (
        <div className="risk_adjustment_chart_container" style={{ height }}>
            <div className="risk_adjustment_chart_header">
                <h3 className="risk_adjustment_chart_title">{title}</h3>
                <div className="risk_adjustment_chart_legend">
                    {Object.entries(metalColors).map(([metal, color]) => (
                        <span key={metal} className="risk_adjustment_legend_item">
                            <span 
                                className="risk_adjustment_legend_dot" 
                                style={{ backgroundColor: color }}
                            ></span>
                            {metal.charAt(0).toUpperCase() + metal.slice(1)}
                        </span>
                    ))}
                </div>
            </div>
            <div className="risk_adjustment_chart_content">
                <div className="risk_adjustment_y_axis">
                    <span className="risk_adjustment_y_label">+${maxActual.toFixed(0)}</span>
                    <span className="risk_adjustment_y_label">$0</span>
                    <span className="risk_adjustment_y_label">-${maxActual.toFixed(0)}</span>
                </div>
                <div className="risk_adjustment_chart_area">
                    <svg className="risk_adjustment_svg" viewBox="0 0 400 300">
                        {/* Grid lines */}
                        <g className="risk_adjustment_grid">
                            <line x1="0" y1="75" x2="400" y2="75" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                            <line x1="0" y1="150" x2="400" y2="150" stroke="var(--color-border-primary)" strokeOpacity="0.5"/>
                            <line x1="0" y1="225" x2="400" y2="225" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                            <line x1="100" y1="0" x2="100" y2="300" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                            <line x1="200" y1="0" x2="200" y2="300" stroke="var(--color-border-primary)" strokeOpacity="0.5"/>
                            <line x1="300" y1="0" x2="300" y2="300" stroke="var(--color-border-primary)" strokeOpacity="0.3"/>
                        </g>

                        {/* Data points */}
                        {scatterData.map((d, i) => {
                            const x = 200 + (d.riskAdjustment / maxRisk) * 180;
                            const y = 150 - (d.actualDifference / maxActual) * 140;
                            return (
                                <circle
                                    key={i}
                                    cx={Math.max(10, Math.min(390, x))}
                                    cy={Math.max(10, Math.min(290, y))}
                                    r="4"
                                    fill={metalColors[d.metal as keyof typeof metalColors]}
                                    className="risk_adjustment_point"
                                    opacity="0.7"
                                >
                                    <title>
                                        {`${d.id} (${d.metal}): Risk Adj: $${d.riskAdjustment.toFixed(2)}, Actual Diff: $${d.actualDifference.toFixed(2)}, P&L: $${d.profitLoss.toFixed(2)}`}
                                    </title>
                                </circle>
                            );
                        })}
                    </svg>
                </div>
                <div className="risk_adjustment_x_axis">
                    <span className="risk_adjustment_x_label">-${maxRisk.toFixed(0)}</span>
                    <span className="risk_adjustment_x_label">Risk Adjustment</span>
                    <span className="risk_adjustment_x_label">+${maxRisk.toFixed(0)}</span>
                </div>
            </div>
        </div>
    );
};

export default RiskAdjustmentChart;
