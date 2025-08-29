import React, { useState } from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import '../../styles/chartRules.css';
import './VolatilityHeatmapChart.css';

// === Embedded EUR/USD data ===
const TS = [1736035200,1736640000,1737244800,1737849600,1738454400,1739059200,1739664000,1740268800,1740873600,1741478400,1742083200,1742688000,1743292800,1743897600,1744502400,1745107200,1745712000,1746316800,1746921600,1747526400,1748131200,1748736000,1749340800,1749945600,1750550400,1751155200,1751760000,1752364800,1752969600,1753574400,1754179200,1754784000,1755388800,1755993600,1756598400];

const PRICES = [1.04325,1.03011,1.02467,1.02772,1.04854,1.02536,1.02954,1.04884,1.04754,1.04032,1.08496,1.08821,1.08201,1.08983,1.09875,1.08729,1.09018,1.09035,1.09774,1.09341,1.10945,1.12309,1.12024,1.11464,1.11738,1.10405,1.10186,1.10664,1.10824,1.12989,1.17614,1.15917,1.16465,1.17142,1.17228];

// Helper functions for FX data
function priceAt(tSec: number): number | null {
  const n = TS.length;
  if (n === 0) return null;
  if (tSec < TS[0] || tSec > TS[n - 1]) return null;

  let idx = binarySearch(TS, tSec);
  if (idx >= 0) return PRICES[idx];

  const insertPos = ~idx;
  if (insertPos === 0 || insertPos === n) return null;
  
  const t0 = TS[insertPos - 1], t1 = TS[insertPos];
  const p0 = PRICES[insertPos - 1], p1 = PRICES[insertPos];
  const alpha = (tSec - t0) / (t1 - t0);
  return p0 + alpha * (p1 - p0);
}

function binarySearch(arr: number[], x: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const v = arr[mid];
    if (v === x) return mid;
    if (v < x) lo = mid + 1;
    else hi = mid - 1;
  }
  return ~lo;
}

function toUnixSeconds(ts: string): number | null {
  try {
    const d = new Date(ts);
    const ms = d.getTime();
    if (!isFinite(ms)) return null;
    return Math.floor(ms / 1000);
  } catch {
    return null;
  }
}

interface VolatilityHeatmapChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

interface ScatterPoint {
    id: string;
    fxPrice: number;
    pnl: number; // execution price - risk price
    isAnomaly: boolean;
    trade: MetalTrade;
}

const VolatilityHeatmapChart: React.FC<VolatilityHeatmapChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const [anomalySensitivity, setAnomalySensitivity] = useState(2.0);
    const [selectedPoint, setSelectedPoint] = useState<ScatterPoint | null>(null);

    const completedTrades = trades.filter(trade => trade.status === 'completed');

    // Calculate scatter plot data
    const calculateScatterData = (): ScatterPoint[] => {
        if (completedTrades.length === 0) return [];

        const scatterPoints: ScatterPoint[] = [];
        
        for (const trade of completedTrades) {
            const tSec = toUnixSeconds(trade.timestamp);
            if (tSec === null) continue;
            
            const fxPrice = priceAt(tSec);
            if (fxPrice === null) continue;
            
            const pnl = trade.actualSalePrice - trade.riskPrice;
            
            scatterPoints.push({
                id: trade.id,
                fxPrice,
                pnl,
                isAnomaly: false, // Will be calculated below
                trade
            });
        }
        
        // Anomaly detection using statistical outliers
        if (scatterPoints.length > 0) {
            const pnlValues = scatterPoints.map(p => p.pnl);
            const mean = pnlValues.reduce((sum, val) => sum + val, 0) / pnlValues.length;
            const variance = pnlValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / pnlValues.length;
            const stdDev = Math.sqrt(variance);
            
            // Mark points as anomalies if they are more than anomalySensitivity standard deviations from mean
            scatterPoints.forEach(point => {
                const zScore = Math.abs(point.pnl - mean) / stdDev;
                point.isAnomaly = zScore > anomalySensitivity;
            });
        }
        
        return scatterPoints;
    };

    const scatterData = calculateScatterData();
    
    // Chart dimensions - matching other charts
    const chartWidth = 600;
    const chartHeight = 200;
    
    // Calculate scales with proper margins
    const fxPrices = scatterData.map(p => p.fxPrice);
    const pnlValues = scatterData.map(p => p.pnl);
    
    const fxMin = fxPrices.length > 0 ? Math.min(...fxPrices) : 1.0;
    const fxMax = fxPrices.length > 0 ? Math.max(...fxPrices) : 1.2;
    const pnlMin = pnlValues.length > 0 ? Math.min(...pnlValues) : -100;
    const pnlMax = pnlValues.length > 0 ? Math.max(...pnlValues) : 100;
    
    // Add some padding to the ranges
    const fxRange = fxMax - fxMin;
    const pnlRange = pnlMax - pnlMin;
    const fxPadding = fxRange * 0.1;
    const pnlPadding = pnlRange * 0.1;
    
    // Simple scaling functions like other charts
    const scaleX = (fx: number) => 20 + ((fx - (fxMin - fxPadding)) / (fxRange + 2 * fxPadding)) * 560;
    const scaleY = (pnl: number) => 20 + ((pnlMax + pnlPadding - pnl) / (pnlRange + 2 * pnlPadding)) * 160;

    const handlePointClick = (point: ScatterPoint) => {
        setSelectedPoint(point);
    };

    const anomalyCount = scatterData.filter(point => point.isAnomaly).length;

    return (
        <div className="volatility_heatmap_chart_container chart_container" style={{ height }}>
            <div className="volatility_heatmap_chart_header chart_header">
                <h3 className="volatility_heatmap_chart_title chart_title">{title}</h3>
                <div className="volatility_heatmap_controls">
                    <div className="volatility_sensitivity_control">
                        <label>Anomaly Threshold (σ):</label>
                        <input 
                            type="range" 
                            min="1.0" 
                            max="3.0" 
                            step="0.1" 
                            value={anomalySensitivity}
                            onChange={(e) => setAnomalySensitivity(parseFloat(e.target.value))}
                        />
                        <span>{anomalySensitivity.toFixed(1)}</span>
                    </div>
                    <div className="volatility_anomaly_summary">
                        <span className="anomaly_count">{anomalyCount} anomalies</span>
                    </div>
                </div>
            </div>
            <div className="volatility_heatmap_chart_content chart_content">
                <div className="volatility_heatmap_main_area">
                    <div className="volatility_heatmap_y_axis chart_y_axis">
                        <span className="volatility_heatmap_y_label chart_y_label" style={{top: '10%'}}>${pnlMax.toFixed(0)}</span>
                        <span className="volatility_heatmap_y_label chart_y_label" style={{top: '30%'}}>${(pnlMax * 0.5).toFixed(0)}</span>
                        <span className="volatility_heatmap_y_label chart_y_label" style={{top: '50%'}}>$0</span>
                        <span className="volatility_heatmap_y_label chart_y_label" style={{top: '70%'}}>${(pnlMin * 0.5).toFixed(0)}</span>
                        <span className="volatility_heatmap_y_label chart_y_label" style={{top: '90%'}}>${pnlMin.toFixed(0)}</span>
                    </div>
                    <div className="volatility_heatmap_chart_area chart_area">
                        <svg className="volatility_heatmap_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Grid lines */}
                            <g className="scatter_grid">
                                {/* Horizontal grid lines */}
                                <line x1={20} y1={scaleY(0)} x2={580} y2={scaleY(0)} stroke="var(--color-border-secondary)" strokeWidth="1" opacity="0.5"/>
                                <line x1={20} y1={scaleY(pnlMax * 0.5)} x2={580} y2={scaleY(pnlMax * 0.5)} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                <line x1={20} y1={scaleY(pnlMin * 0.5)} x2={580} y2={scaleY(pnlMin * 0.5)} stroke="var(--color-border-tertiary)" strokeWidth="0.5" opacity="0.3"/>
                                
                                {/* Vertical grid lines */}
                                {[0.25, 0.5, 0.75].map(fraction => {
                                    const fxValue = fxMin + fraction * fxRange;
                                    return (
                                        <line 
                                            key={fraction}
                                            x1={scaleX(fxValue)} 
                                            y1={20} 
                                            x2={scaleX(fxValue)} 
                                            y2={180} 
                                            stroke="var(--color-border-tertiary)" 
                                            strokeWidth="0.5" 
                                            opacity="0.3"
                                        />
                                    );
                                })}
                            </g>

                            {/* Scatter points */}
                            {scatterData.map((point) => {
                                const x = scaleX(point.fxPrice);
                                const y = scaleY(point.pnl);
                                
                                return (
                                    <circle
                                        key={point.id}
                                        cx={x}
                                        cy={y}
                                        r={point.isAnomaly ? "6" : "4"}
                                        fill={point.isAnomaly ? "var(--color-danger-500)" : "var(--color-primary-500)"}
                                        stroke={point.isAnomaly ? "var(--color-danger-700)" : "var(--color-primary-700)"}
                                        strokeWidth={point.isAnomaly ? "2" : "1"}
                                        className="scatter_point"
                                        onClick={() => handlePointClick(point)}
                                        style={{ cursor: 'pointer' }}
                                        opacity={point.isAnomaly ? "0.9" : "0.7"}
                                    >
                                        <title>
                                            {`Trade ${point.id}: FX Rate ${point.fxPrice.toFixed(4)}, P&L $${point.pnl.toFixed(2)}${point.isAnomaly ? ' (ANOMALY)' : ''}`}
                                        </title>
                                    </circle>
                                );
                            })}
                        </svg>
                    </div>
                    <div className="volatility_heatmap_color_scale">
                        <div className="volatility_color_scale_title">Legend</div>
                        <div className="scatter_legend">
                            <div className="legend_item">
                                <div className="legend_dot" style={{backgroundColor: 'var(--color-primary-500)', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '8px'}}></div>
                                <span>Normal Trade</span>
                            </div>
                            <div className="legend_item" style={{marginTop: '4px'}}>
                                <div className="legend_dot" style={{backgroundColor: 'var(--color-danger-500)', width: '8px', height: '8px', borderRadius: '50%', display: 'inline-block', marginRight: '8px'}}></div>
                                <span>Anomaly</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="volatility_heatmap_x_axis chart_x_axis">
                    {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => {
                        const fxValue = fxMin + fraction * fxRange;
                        const position = `${10 + fraction * 80}%`;
                        return (
                            <span 
                                key={i} 
                                className="volatility_heatmap_x_label chart_x_label"
                                style={{ position: 'absolute', left: position, transform: 'translateX(-50%)' }}
                            >
                                {fxValue.toFixed(3)}
                            </span>
                        );
                    })}
                </div>
                
                {/* Selected point details panel */}
                {selectedPoint && (
                    <div className="volatility_cell_details">
                        <div className="volatility_details_header">
                            <h4>Trade {selectedPoint.id}</h4>
                            <button onClick={() => setSelectedPoint(null)}>×</button>
                        </div>
                        <div className="volatility_details_content">
                            <div className="volatility_detail_item">
                                <span>Metal:</span>
                                <span>{selectedPoint.trade.metal.toUpperCase()}</span>
                            </div>
                            <div className="volatility_detail_item">
                                <span>FX Rate:</span>
                                <span>{selectedPoint.fxPrice.toFixed(4)}</span>
                            </div>
                            <div className="volatility_detail_item">
                                <span>P&L:</span>
                                <span>${selectedPoint.pnl.toFixed(2)}</span>
                            </div>
                            <div className="volatility_detail_item">
                                <span>Risk Price:</span>
                                <span>${selectedPoint.trade.riskPrice.toFixed(2)}</span>
                            </div>
                            <div className="volatility_detail_item">
                                <span>Execution Price:</span>
                                <span>${selectedPoint.trade.actualSalePrice.toFixed(2)}</span>
                            </div>
                            {selectedPoint.isAnomaly && (
                                <div className="volatility_detail_item anomaly">
                                    <span>Status:</span>
                                    <span className="anomaly_type">ANOMALY DETECTED</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VolatilityHeatmapChart;
