import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import '../../styles/chartRules.css';
import './PriceDistributionBoxplot.css';

interface PriceDistributionBoxplotProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

interface BoxplotData {
    min: number;
    q1: number;
    median: number;
    q3: number;
    max: number;
    outliers: number[];
    mean: number;
}

const PriceDistributionBoxplot: React.FC<PriceDistributionBoxplotProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const completedTrades = trades.filter(trade => trade.status === 'completed');
    
    // Calculate percentage differences between execution price and risk price
    const percentageDifferences = completedTrades.map(trade => {
        const difference = trade.actualSalePrice - trade.riskPrice;
        const percentageDiff = (difference / trade.riskPrice) * 100;
        return percentageDiff;
    }).filter(diff => !isNaN(diff) && isFinite(diff));

    // Calculate boxplot statistics
    const calculateBoxplotData = (data: number[]): BoxplotData => {
        if (data.length === 0) {
            return { min: 0, q1: 0, median: 0, q3: 0, max: 0, outliers: [], mean: 0 };
        }

        const sorted = [...data].sort((a, b) => a - b);
        const n = sorted.length;
        
        const median = n % 2 === 0 
            ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 
            : sorted[Math.floor(n / 2)];
        
        const q1Index = Math.floor(n * 0.25);
        const q3Index = Math.floor(n * 0.75);
        const q1 = sorted[q1Index];
        const q3 = sorted[q3Index];
        
        const iqr = q3 - q1;
        const lowerFence = q1 - 1.5 * iqr;
        const upperFence = q3 + 1.5 * iqr;
        
        const outliers = sorted.filter(val => val < lowerFence || val > upperFence);
        const nonOutliers = sorted.filter(val => val >= lowerFence && val <= upperFence);
        
        const min = nonOutliers.length > 0 ? Math.min(...nonOutliers) : sorted[0];
        const max = nonOutliers.length > 0 ? Math.max(...nonOutliers) : sorted[sorted.length - 1];
        const mean = data.reduce((sum, val) => sum + val, 0) / data.length;
        
        return { min, q1, median, q3, max, outliers, mean };
    };

    const boxplotData = calculateBoxplotData(percentageDifferences);
    
    // Calculate chart dimensions and scaling
    const chartWidth = 600;
    const chartHeight = 200;
    const boxWidth = 80;
    const centerX = chartWidth / 2;
    
    const dataRange = Math.max(
        Math.abs(boxplotData.min), 
        Math.abs(boxplotData.max),
        ...boxplotData.outliers.map(Math.abs)
    );
    const padding = dataRange * 0.1;
    const totalRange = (dataRange + padding) * 2;
    
    const scaleY = (value: number) => {
        return chartHeight / 2 - (value / totalRange) * chartHeight * 0.8;
    };

    return (
        <div className="price_distribution_boxplot_container chart_container" style={{ height }}>
            <div className="price_distribution_boxplot_header chart_header">
                <h3 className="price_distribution_boxplot_title chart_title">{title}</h3>
                <div className="price_distribution_boxplot_legend chart_legend">
                    <span className="price_distribution_legend_item chart_legend_item">
                        <span className="price_distribution_legend_box"></span>
                        Price Difference Distribution
                    </span>
                </div>
            </div>
            <div className="price_distribution_boxplot_content chart_content">
                <div className="price_distribution_main_area">
                    <div className="price_distribution_y_axis chart_y_axis">
                        <span className="price_distribution_y_label chart_y_label">+{dataRange.toFixed(1)}%</span>
                        <span className="price_distribution_y_label chart_y_label">0%</span>
                        <span className="price_distribution_y_label chart_y_label">-{dataRange.toFixed(1)}%</span>
                    </div>
                    <div className="price_distribution_chart_area chart_area">
                        <svg className="price_distribution_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Grid lines */}
                            <g className="price_distribution_grid chart_grid">
                                <line x1="0" y1={chartHeight * 0.1} x2={chartWidth} y2={chartHeight * 0.1} className="grid_line"/>
                                <line x1="0" y1={chartHeight * 0.5} x2={chartWidth} y2={chartHeight * 0.5} className="major_line"/>
                                <line x1="0" y1={chartHeight * 0.9} x2={chartWidth} y2={chartHeight * 0.9} className="grid_line"/>
                            </g>

                            {percentageDifferences.length > 0 && (
                                <g className="price_distribution_boxplot">
                                    {/* Whiskers */}
                                    <line 
                                        x1={centerX} 
                                        y1={scaleY(boxplotData.min)} 
                                        x2={centerX} 
                                        y2={scaleY(boxplotData.q1)}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    <line 
                                        x1={centerX} 
                                        y1={scaleY(boxplotData.q3)} 
                                        x2={centerX} 
                                        y2={scaleY(boxplotData.max)}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Whisker caps */}
                                    <line 
                                        x1={centerX - 15} 
                                        y1={scaleY(boxplotData.min)} 
                                        x2={centerX + 15} 
                                        y2={scaleY(boxplotData.min)}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    <line 
                                        x1={centerX - 15} 
                                        y1={scaleY(boxplotData.max)} 
                                        x2={centerX + 15} 
                                        y2={scaleY(boxplotData.max)}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Box */}
                                    <rect
                                        x={centerX - boxWidth / 2}
                                        y={scaleY(boxplotData.q3)}
                                        width={boxWidth}
                                        height={scaleY(boxplotData.q1) - scaleY(boxplotData.q3)}
                                        fill="var(--color-primary-500)"
                                        fillOpacity="0.3"
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Median line */}
                                    <line 
                                        x1={centerX - boxWidth / 2} 
                                        y1={scaleY(boxplotData.median)} 
                                        x2={centerX + boxWidth / 2} 
                                        y2={scaleY(boxplotData.median)}
                                        stroke="var(--color-primary-700)"
                                        strokeWidth="3"
                                    />
                                    
                                    {/* Mean line */}
                                    <line 
                                        x1={centerX - boxWidth / 2} 
                                        y1={scaleY(boxplotData.mean)} 
                                        x2={centerX + boxWidth / 2} 
                                        y2={scaleY(boxplotData.mean)}
                                        stroke="var(--color-warning-500)"
                                        strokeWidth="3"
                                        strokeDasharray="4,2"
                                    >
                                        <title>Mean: {boxplotData.mean.toFixed(2)}%</title>
                                    </line>
                                    
                                    {/* Outliers */}
                                    {boxplotData.outliers.map((outlier, index) => (
                                        <circle
                                            key={index}
                                            cx={centerX + (Math.random() - 0.5) * 20}
                                            cy={scaleY(outlier)}
                                            r="3"
                                            fill="var(--color-danger-500)"
                                            fillOpacity="0.7"
                                            className="chart_point"
                                        >
                                            <title>Outlier: {outlier.toFixed(2)}%</title>
                                        </circle>
                                    ))}
                                </g>
                            )}
                        </svg>
                    </div>
                </div>
                <div className="price_distribution_x_axis chart_x_axis">
                    <div className="price_distribution_stats">
                        <div className="price_distribution_stat_item">
                            <span className="price_distribution_stat_label">Mean:</span>
                            <span className="price_distribution_stat_value">{boxplotData.mean.toFixed(2)}%</span>
                        </div>
                        <div className="price_distribution_stat_item">
                            <span className="price_distribution_stat_label">Median:</span>
                            <span className="price_distribution_stat_value">{boxplotData.median.toFixed(2)}%</span>
                        </div>
                        <div className="price_distribution_stat_item">
                            <span className="price_distribution_stat_label">Trades:</span>
                            <span className="price_distribution_stat_value">{percentageDifferences.length}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PriceDistributionBoxplot;
