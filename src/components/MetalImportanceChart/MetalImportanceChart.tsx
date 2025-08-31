import React from 'react';
import '../../styles/chartRules.css';
import './MetalImportanceChart.css';
import metalAnalysisData from '../../../metal_analysis_readable.json';

interface MetalImportanceChartProps {
    selectedMetal: string;
    height?: number;
    title: string;
}

interface ImportanceData {
    feature: string;
    importance: number;
}

const MetalImportanceChart: React.FC<MetalImportanceChartProps> = ({ 
    selectedMetal, 
    height = 300, 
    title 
}) => {
    // Get importance data for selected metal
    const getImportanceData = (): ImportanceData[] => {
        const metalKey = selectedMetal.charAt(0).toUpperCase() + selectedMetal.slice(1).toLowerCase();
        const metalData = (metalAnalysisData as any)[metalKey];
        
        if (!metalData || !metalData.model_importance) {
            return [];
        }

        // Already sorted by importance (highest to lowest) in the JSON
        return metalData.model_importance;
    };

    const importanceData = getImportanceData();
    
    if (importanceData.length === 0) {
        return (
            <div className="metal_importance_chart_container chart_container" style={{ height }}>
                <div className="metal_importance_chart_header chart_header">
                    <h3 className="metal_importance_chart_title chart_title">{title}</h3>
                </div>
                <div className="chart_no_data">No importance data available for {selectedMetal}</div>
            </div>
        );
    }

    // Chart dimensions
    const chartWidth = 600;
    const chartHeight = Math.max(200, importanceData.length * 10); // Dynamic height based on data
    const marginLeft = 120; // Space for feature labels
    const marginRight = 50;
    const plotWidth = chartWidth - marginLeft - marginRight;
    
    // Find max importance for scaling
    const maxImportance = Math.max(...importanceData.map(d => d.importance));
    const scale = maxImportance > 0 ? plotWidth / maxImportance : 1;
    
    // Remove unused scaleX function

    return (
        <div className="metal_importance_chart_container chart_container" style={{ height: chartHeight + 200 }}>
            <div className="metal_importance_chart_header chart_header">
                <h3 className="metal_importance_chart_title chart_title">{title}</h3>
                <div className="metal_importance_chart_legend chart_legend">
                    <span className="metal_importance_legend_item chart_legend_item">
                        <span className="metal_importance_legend_bar" style={{ backgroundColor: 'var(--color-success-500)' }}></span>
                        Feature Importance
                    </span>
                </div>
            </div>
            <div className="metal_importance_chart_content chart_content">
                <div className="metal_importance_main_area">
                    <div className="metal_importance_chart_area chart_area">
                        <svg className="metal_importance_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Grid lines */}
                            <g className="metal_importance_grid chart_grid">
                                {/* Vertical grid lines */}
                                <line 
                                    x1={marginLeft} 
                                    y1="10" 
                                    x2={marginLeft} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-primary)" 
                                    strokeWidth="2" 
                                    opacity="0.8"
                                />
                                
                                {/* Quarter lines */}
                                <line 
                                    x1={marginLeft + plotWidth * 0.25} 
                                    y1="10" 
                                    x2={marginLeft + plotWidth * 0.25} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-tertiary)" 
                                    strokeWidth="1" 
                                    opacity="0.4"
                                />
                                <line 
                                    x1={marginLeft + plotWidth * 0.5} 
                                    y1="10" 
                                    x2={marginLeft + plotWidth * 0.5} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-tertiary)" 
                                    strokeWidth="1" 
                                    opacity="0.4"
                                />
                                <line 
                                    x1={marginLeft + plotWidth * 0.75} 
                                    y1="10" 
                                    x2={marginLeft + plotWidth * 0.75} 
                                    y2={chartHeight - 10} 
                                    stroke="var(--color-border-tertiary)" 
                                    strokeWidth="1" 
                                    opacity="0.4"
                                />
                                
                                {/* Horizontal grid lines for each feature */}
                                {importanceData.map((_, index) => {
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

                            {/* Importance bars */}
                            {importanceData.map((data, index) => {
                                const y = 10 + index * 10;
                                const barHeight = 5;
                                const barWidth = data.importance * scale;
                                const barX = marginLeft;
                                
                                // Color gradient based on importance rank
                                const intensity = 1 - (index / importanceData.length);
                                const color = `hsl(142, 76%, ${Math.max(35, 85 - intensity * 50)}%)`;
                                
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
                                            <title>{`${data.feature}: ${data.importance.toFixed(4)}`}</title>
                                        </rect>
                                        
                                        {/* Feature label */}
                                        <text
                                            x={marginLeft - 10}
                                            y={y + barHeight / 2 + 4}
                                            textAnchor="end"
                                            fontSize="8"
                                            fill="var(--color-text-primary)"
                                            className="metal_importance_feature_label"
                                        >
                                            {data.feature}
                                        </text>
                                        
                                        {/* Importance value */}
                                        <text
                                            x={barX + barWidth + 5}
                                            y={y + barHeight / 2 + 4}
                                            textAnchor="start"
                                            fontSize="8"
                                            fill="var(--color-text-secondary)"
                                            fontWeight="500"
                                        >
                                            {data.importance.toFixed(4)}
                                        </text>
                                        
                                        {/* Rank number */}
                                        <text
                                            x={marginLeft - 130}
                                            y={y + barHeight / 2 + 4}
                                            textAnchor="middle"
                                            fontSize="8"
                                            fill="var(--color-text-tertiary)"
                                            fontWeight="600"
                                        >
                                            #{index + 1}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="metal_importance_x_axis ">
                    <div className="metal_importance_x_labels">
                        <span className="metal_importance_x_label chart_x_label" style={{left: '20%'}}>
                            0.00
                        </span>
                        <span className="metal_importance_x_label chart_x_label" style={{left: '35%'}}>
                            {(maxImportance * 0.25).toFixed(3)}
                        </span>
                        <span className="metal_importance_x_label chart_x_label" style={{left: '50%'}}>
                            {(maxImportance * 0.5).toFixed(3)}
                        </span>
                        <span className="metal_importance_x_label chart_x_label" style={{left: '65%'}}>
                            {(maxImportance * 0.75).toFixed(3)}
                        </span>
                        <span className="metal_importance_x_label chart_x_label" style={{left: '80%'}}>
                            {maxImportance.toFixed(3)}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MetalImportanceChart;
