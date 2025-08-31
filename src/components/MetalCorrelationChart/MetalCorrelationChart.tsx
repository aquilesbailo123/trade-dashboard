import React from 'react';
import '../../styles/chartRules.css';
import './MetalCorrelationChart.css';
import metalAnalysisData from '../../../metal_analysis_readable.json';

interface MetalCorrelationChartProps {
    selectedMetal: string;
    height?: number;
    title: string;
}

interface CorrelationData {
    feature: string;
    correlation: number;
}

const MetalCorrelationChart: React.FC<MetalCorrelationChartProps> = ({ 
    selectedMetal, 
    height = 300, 
    title 
}) => {
    // Get correlation data for selected metal
    const getCorrelationData = (): CorrelationData[] => {
        const metalKey = selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1).toLowerCase();
        const metalData = (metalAnalysisData as any)[metalKey];
        
        if (!metalData || !metalData.correlation) {
            return [];
        }

        // Sort by absolute correlation value (highest to lowest)
        return metalData.correlation.sort((a: any, b: any) => Math.abs(b.correlation) - Math.abs(a.correlation));
    };

    const correlationData = getCorrelationData();
    
    if (correlationData.length === 0) {
        return (
            <div className="metal_correlation_chart_container chart_container" style={{ height }}>
                <div className="metal_correlation_chart_header chart_header">
                    <h3 className="metal_correlation_chart_title chart_title">{title}</h3>
                </div>
                <div className="chart_no_data">No correlation data available for {selectedMetal}</div>
            </div>
        );
    }

    // Chart dimensions
    const chartWidth = 600;
    const chartHeight = Math.max(200, correlationData.length * 10); // Dynamic height based on data
    const marginLeft = 120; // Space for feature labels
    const marginRight = 50;
    const plotWidth = chartWidth - marginLeft - marginRight;
    
    // Find max absolute correlation for scaling
    const maxAbsCorrelation = Math.max(...correlationData.map(d => Math.abs(d.correlation)));
    const scale = maxAbsCorrelation > 0 ? plotWidth / (2 * maxAbsCorrelation) : 1;
    
    // Center line position
    const centerX = marginLeft + plotWidth / 2;
    
    return (
        <div className="metal_correlation_chart_container chart_container" style={{ height: chartHeight + 200 }}>
            <div className="metal_correlation_chart_header chart_header">
                <h3 className="metal_correlation_chart_title chart_title">{title}</h3>
                <div className="metal_correlation_chart_legend chart_legend">
                    <span className="metal_correlation_legend_item chart_legend_item">
                        <span className="metal_correlation_legend_bar" style={{ backgroundColor: 'var(--color-primary-500)' }}></span>
                        Positive Correlation
                    </span>
                    <span className="metal_correlation_legend_item chart_legend_item">
                        <span className="metal_correlation_legend_bar" style={{ backgroundColor: 'var(--color-danger-500)' }}></span>
                        Negative Correlation
                    </span>
                </div>
            </div>
            <div className="metal_correlation_chart_content chart_content">
                <div className="metal_correlation_main_area">
                    <div className="metal_correlation_chart_area chart_area">
                        <svg className="metal_correlation_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Grid lines */}
                            <g className="metal_correlation_grid chart_grid">
                                {/* Center line at 0 */}
                                <line 
                                    x1={centerX} 
                                    y1="10" 
                                    x2={centerX} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-primary)" 
                                    strokeWidth="2" 
                                    opacity="0.8"
                                />
                                
                                {/* Quarter lines */}
                                <line 
                                    x1={centerX - plotWidth / 4} 
                                    y1="10" 
                                    x2={centerX - plotWidth / 4} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-tertiary)" 
                                    strokeWidth="1" 
                                    opacity="0.4"
                                />
                                <line 
                                    x1={centerX + plotWidth / 4} 
                                    y1="10" 
                                    x2={centerX + plotWidth / 4} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-tertiary)" 
                                    strokeWidth="1" 
                                    opacity="0.4"
                                />
                                
                                {/* Horizontal grid lines for each feature */}
                                {correlationData.map((_, index) => {
                                    const y = 15 + index * 15;
                                    return (
                                        <line 
                                            key={index}
                                            x1={marginLeft} 
                                            y1={y + 10} 
                                            x2={chartWidth - marginRight} 
                                            y2={y + 10} 
                                            stroke="var(--color-border-tertiary)" 
                                            strokeWidth="0.5" 
                                            opacity="0.2"
                                        />
                                    );
                                })}
                            </g>

                            {/* Correlation bars */}
                            {correlationData.map((data, index) => {
                                const y = 10 + index * 10;
                                const barHeight = 5;
                                const isPositive = data.correlation >= 0;
                                const barWidth = Math.abs(data.correlation * scale);
                                const barX = isPositive ? centerX : centerX - barWidth;
                                const color = isPositive ? 'var(--color-primary-500)' : 'var(--color-danger-500)';
                                
                                return (
                                    <g key={index}>
                                        {/* Bar */}
                                        <rect
                                            x={barX}
                                            y={y}
                                            width={barWidth}
                                            height={barHeight}
                                            fill={color}
                                            opacity="0.8"
                                            className="chart_bar"
                                        >
                                            <title>{`${data.feature}: ${data.correlation.toFixed(3)}`}</title>
                                        </rect>
                                        
                                        {/* Feature label */}
                                        <text
                                            x={marginLeft - 10}
                                            y={y + barHeight / 2 + 4}
                                            textAnchor="end"
                                            fontSize="8"
                                            fill="var(--color-text-primary)"
                                            className="metal_correlation_feature_label"
                                        >
                                            {data.feature}
                                        </text>
                                        
                                        {/* Correlation value */}
                                        <text
                                            x={isPositive ? barX + barWidth + 5 : barX - 5}
                                            y={y + barHeight / 2 + 4}
                                            textAnchor={isPositive ? "start" : "end"}
                                            fontSize="8"
                                            fill="var(--color-text-secondary)"
                                            fontWeight="500"
                                        >
                                            {data.correlation.toFixed(3)}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="metal_correlation_x_axis">
                    <div className="metal_correlation_x_labels">
                        <span className="metal_correlation_x_label chart_x_label" style={{left: '20%'}}>
                            -{maxAbsCorrelation.toFixed(2)}
                        </span>
                        <span className="metal_correlation_x_label chart_x_label" style={{left: '35%'}}>
                            -{(maxAbsCorrelation * 0.5).toFixed(2)}
                        </span>
                        <span className="metal_correlation_x_label chart_x_label" style={{left: '50%'}}>
                            0.00
                        </span>
                        <span className="metal_correlation_x_label chart_x_label" style={{left: '65%'}}>
                            +{(maxAbsCorrelation * 0.5).toFixed(2)}
                        </span>
                        <span className="metal_correlation_x_label chart_x_label" style={{left: '80%'}}>
                            +{maxAbsCorrelation.toFixed(2)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetalCorrelationChart;
