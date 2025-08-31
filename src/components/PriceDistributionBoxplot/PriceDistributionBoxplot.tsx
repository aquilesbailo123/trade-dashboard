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

    // Calculate additional statistical measures
    const calculateStandardDeviation = (data: number[], mean: number): number => {
        if (data.length === 0) return 0;
        const variance = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / data.length;
        return Math.sqrt(variance);
    };

    // const calculateConfidenceInterval = (data: number[], mean: number, stdDev: number): [number, number] => {
    //     if (data.length === 0) return [0, 0];
    //     const standardError = stdDev / Math.sqrt(data.length);
    //     const margin = 1.96 * standardError; // 95% confidence interval
    //     return [mean - margin, mean + margin];
    // };

    const boxplotData = calculateBoxplotData(percentageDifferences);
    const stdDev = calculateStandardDeviation(percentageDifferences, boxplotData.mean);
    // const [ciLower, ciUpper] = calculateConfidenceInterval(percentageDifferences, boxplotData.mean, stdDev);
    
    // Calculate chart dimensions and scaling for horizontal orientation
    const chartWidth = 600;
    const chartHeight = 200;
    const boxHeight = 60;
    const centerY = chartHeight / 2;
    const marginLeft = 50;
    const marginRight = 50;
    const plotWidth = chartWidth - marginLeft - marginRight;
    
    const dataRange = Math.max(
        Math.abs(boxplotData.min), 
        Math.abs(boxplotData.max),
        ...boxplotData.outliers.map(Math.abs)
    );
    const padding = dataRange * 0.1;
    const totalRange = (dataRange + padding) * 2;
    
    const scaleX = (value: number) => {
        return marginLeft + ((value + dataRange + padding) / totalRange) * plotWidth;
    };

    return (
        <div className="price_distribution_boxplot_container chart_container" style={{ height }}>
            <div className="price_distribution_boxplot_header chart_header">
                <h3 className="price_distribution_boxplot_title chart_title">{title}</h3>
                <div className="price_distribution_boxplot_legend chart_legend">
                    <span className="price_distribution_legend_item chart_legend_item">
                        <span className="price_distribution_legend_line" style={{ backgroundColor: 'var(--color-primary-700)', width: '16px', height: '3px' }}></span>
                        Median
                    </span>
                    <span className="price_distribution_legend_item chart_legend_item">
                        <span className="price_distribution_legend_line" style={{ width: '16px', height: '3px', borderTop: '2px dashed var(--color-warning-500)', backgroundColor: 'transparent' }}></span>
                        Mean
                    </span>
                    <span className="price_distribution_legend_item chart_legend_item">
                        <span className="price_distribution_legend_dot" style={{ backgroundColor: 'var(--color-danger-500)', width: '8px', height: '8px', borderRadius: '50%' }}></span>
                        Outliers
                    </span>
                </div>
            </div>
            <div className="price_distribution_boxplot_content chart_content">
                <div className="price_distribution_main_area">
                    <div className="price_distribution_y_axis chart_y_axis">
                        <span className="price_distribution_y_label chart_y_label">Dist.</span>
                    </div>
                    <div className="chart_area price_distribution_chart_area">
                        <svg className="price_distribution_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Comprehensive grid lines */}
                            <g className="price_distribution_grid chart_grid">
                                {/* Major vertical grid lines */}
                                <line x1={marginLeft} y1="20" x2={marginLeft} y2={chartHeight - 20} stroke="var(--color-border-secondary)" strokeWidth="1" opacity="0.4"/>
                                <line x1={scaleX(0)} y1="20" x2={scaleX(0)} y2={chartHeight - 20} stroke="var(--color-border-primary)" strokeWidth="2" opacity="0.8"/>
                                <line x1={chartWidth - marginRight} y1="20" x2={chartWidth - marginRight} y2={chartHeight - 20} stroke="var(--color-border-secondary)" strokeWidth="1" opacity="0.4"/>
                                
                                {/* Additional vertical grid lines for better granularity */}
                                <line x1={scaleX(-dataRange * 0.75)} y1="20" x2={scaleX(-dataRange * 0.75)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={scaleX(-dataRange * 0.5)} y1="20" x2={scaleX(-dataRange * 0.5)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={scaleX(-dataRange * 0.25)} y1="20" x2={scaleX(-dataRange * 0.25)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={scaleX(dataRange * 0.25)} y1="20" x2={scaleX(dataRange * 0.25)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={scaleX(dataRange * 0.5)} y1="20" x2={scaleX(dataRange * 0.5)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={scaleX(dataRange * 0.75)} y1="20" x2={scaleX(dataRange * 0.75)} y2={chartHeight - 20} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                
                                {/* Horizontal reference lines */}
                                <line x1={marginLeft} y1="40" x2={chartWidth - marginRight} y2="40" stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.2"/>
                                <line x1={marginLeft} y1={centerY} x2={chartWidth - marginRight} y2={centerY} stroke="var(--color-border-secondary)" strokeWidth="1" opacity="0.4"/>
                                <line x1={marginLeft} y1="160" x2={chartWidth - marginRight} y2="160" stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.2"/>
                            </g>

                            {percentageDifferences.length > 0 && (
                                <g className="price_distribution_boxplot">
                                    {/* Horizontal whiskers */}
                                    <line 
                                        x1={scaleX(boxplotData.min)} 
                                        y1={centerY} 
                                        x2={scaleX(boxplotData.q1)} 
                                        y2={centerY}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    <line 
                                        x1={scaleX(boxplotData.q3)} 
                                        y1={centerY} 
                                        x2={scaleX(boxplotData.max)} 
                                        y2={centerY}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Whisker caps */}
                                    <line 
                                        x1={scaleX(boxplotData.min)} 
                                        y1={centerY - 15} 
                                        x2={scaleX(boxplotData.min)} 
                                        y2={centerY + 15}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    <line 
                                        x1={scaleX(boxplotData.max)} 
                                        y1={centerY - 15} 
                                        x2={scaleX(boxplotData.max)} 
                                        y2={centerY + 15}
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Box */}
                                    <rect
                                        x={scaleX(boxplotData.q1)}
                                        y={centerY - boxHeight / 2}
                                        width={scaleX(boxplotData.q3) - scaleX(boxplotData.q1)}
                                        height={boxHeight}
                                        fill="var(--color-primary-500)"
                                        fillOpacity="0.3"
                                        stroke="var(--color-primary-500)"
                                        strokeWidth="2"
                                    />
                                    
                                    {/* Median line */}
                                    <line 
                                        x1={scaleX(boxplotData.median)} 
                                        y1={centerY - boxHeight / 2} 
                                        x2={scaleX(boxplotData.median)} 
                                        y2={centerY + boxHeight / 2}
                                        stroke="var(--color-primary-700)"
                                        strokeWidth="3"
                                    />
                                    
                                    {/* Mean line */}
                                    <line 
                                        x1={scaleX(boxplotData.mean)} 
                                        y1={centerY - boxHeight / 2} 
                                        x2={scaleX(boxplotData.mean)} 
                                        y2={centerY + boxHeight / 2}
                                        stroke="var(--color-warning-500)"
                                        strokeWidth="3"
                                        strokeDasharray="4,2"
                                    >
                                        <title>Mean: {boxplotData.mean.toFixed(2)}%</title>
                                    </line>
                                    
                                    {/* Confidence interval for mean */}
                                    {/* <rect
                                        x={scaleX(ciLower)}
                                        y={centerY - 8}
                                        width={scaleX(ciUpper) - scaleX(ciLower)}
                                        height={16}
                                        fill="var(--color-warning-500)"
                                        fillOpacity="0.15"
                                        stroke="var(--color-warning-500)"
                                        strokeWidth="1"
                                        strokeDasharray="2,2"
                                    >
                                        <title>95% Confidence Interval: [{ciLower.toFixed(2)}%, {ciUpper.toFixed(2)}%]</title>
                                    </rect> */}
                                    
                                    {/* Standard deviation markers */}
                                    <line 
                                        x1={scaleX(boxplotData.mean - stdDev)} 
                                        y1={centerY - boxHeight/2 - 10} 
                                        x2={scaleX(boxplotData.mean - stdDev)} 
                                        y2={centerY + boxHeight/2 + 10}
                                        stroke="var(--color-info-500)"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity="0.6"
                                    >
                                        <title>-1 Standard Deviation: {(boxplotData.mean - stdDev).toFixed(2)}%</title>
                                    </line>
                                    <line 
                                        x1={scaleX(boxplotData.mean + stdDev)} 
                                        y1={centerY - boxHeight/2 - 10} 
                                        x2={scaleX(boxplotData.mean + stdDev)} 
                                        y2={centerY + boxHeight/2 + 10}
                                        stroke="var(--color-info-500)"
                                        strokeWidth="1"
                                        strokeDasharray="3,3"
                                        opacity="0.6"
                                    >
                                        <title>+1 Standard Deviation: {(boxplotData.mean + stdDev).toFixed(2)}%</title>
                                    </line>
                                    
                                    {/* Quartile markers on box edges */}
                                    <circle
                                        cx={scaleX(boxplotData.q1)}
                                        cy={centerY - boxHeight/2 - 5}
                                        r="2"
                                        fill="var(--color-primary-700)"
                                    >
                                        <title>Q1: {boxplotData.q1.toFixed(2)}%</title>
                                    </circle>
                                    <circle
                                        cx={scaleX(boxplotData.q3)}
                                        cy={centerY - boxHeight/2 - 5}
                                        r="2"
                                        fill="var(--color-primary-700)"
                                    >
                                        <title>Q3: {boxplotData.q3.toFixed(2)}%</title>
                                    </circle>
                                    
                                    {/* Outliers */}
                                    {boxplotData.outliers.map((outlier, index) => (
                                        <circle
                                            key={index}
                                            cx={scaleX(outlier)}
                                            cy={centerY + (Math.random() - 0.5) * 30}
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
                    <div className="price_distribution_x_labels">
                        <span className="price_distribution_x_label chart_x_label" style={{left: '8%'}}>-{dataRange.toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '20%'}}>-{(dataRange * 0.75).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '32%'}}>-{(dataRange * 0.5).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '44%'}}>-{(dataRange * 0.25).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '50%'}}>0%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '56%'}}>+{(dataRange * 0.25).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '68%'}}>+{(dataRange * 0.5).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '80%'}}>+{(dataRange * 0.75).toFixed(1)}%</span>
                        <span className="price_distribution_x_label chart_x_label" style={{left: '92%'}}>+{dataRange.toFixed(1)}%</span>
                    </div>
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
                            <span className="price_distribution_stat_label">Std Dev:</span>
                            <span className="price_distribution_stat_value">{stdDev.toFixed(2)}%</span>
                        </div>
                        <div className="price_distribution_stat_item">
                            <span className="price_distribution_stat_label">IQR:</span>
                            <span className="price_distribution_stat_value">{(boxplotData.q3 - boxplotData.q1).toFixed(2)}%</span>
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
