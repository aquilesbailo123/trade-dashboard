import React, { useState } from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
import '../../styles/chartRules.css';
import './CorrelationTimelineChart.css';

interface CorrelationTimelineChartProps {
    trades: MetalTrade[];
    height?: number;
    title: string;
}

// === Embedded data from eur_usd_with_timestamps.csv ===
// NOTE: timestamps are Unix seconds (UTC). Arrays are sorted ascending by time.
const TS = [1736035200,1736640000,1737244800,1737849600,1738454400,1739059200,1739664000,1740268800,1740873600,1741478400,1742083200,1742688000,1743292800,1743897600,1744502400,1745107200,1745712000,1746316800,1746921600,1747526400,1748131200,1748736000,1749340800,1749945600,1750550400,1751155200,1751760000,1752364800,1752969600,1753574400,1754179200,1754784000,1755388800,1755993600,1756598400];

const PRICES = [1.04325,1.03011,1.02467,1.02772,1.04854,1.02536,1.02954,1.04884,1.04754,1.04032,1.08496,1.08821,1.08201,1.08983,1.09875,1.08729,1.09018,1.09035,1.09774,1.09341,1.10945,1.12309,1.12024,1.11464,1.11738,1.10405,1.10186,1.10664,1.10824,1.12989,1.17614,1.15917,1.16465,1.17142,1.17228];

// === Core API ===
/**
 * Computes 1-day percent change for a given timestamp using linear interpolation.
 * @param {number} tSec - Target Unix timestamp in **seconds**.
 * @returns {number|null} Fractional change (e.g., 0.0123 = +1.23%), or null if out of range.
 */
function fxOneDayPercentChange(tSec: number): number | null {
  const DAY = 86400;
  const pToday = priceAt(tSec);
  const pYesterday = priceAt(tSec - DAY);
  if (pToday == null || pYesterday == null || pYesterday === 0) return null;
  return (pToday - pYesterday) / pYesterday;
}

// === Helpers ===
/**
 * Linearly interpolates price at timestamp tSec using the TS/PRICES series.
 * @param {number} tSec - Unix seconds.
 * @returns {number|null} Interpolated price or null if tSec outside known range.
 */
function priceAt(tSec: number): number | null {
  const n = TS.length;
  if (n === 0) return null;
  if (tSec < TS[0] || tSec > TS[n - 1]) return null;

  // Exact matches (common when querying weekly anchors)
  let idx = binarySearch(TS, tSec);
  if (idx >= 0) return PRICES[idx];

  // tSec lies between insertPos-1 and insertPos
  const insertPos = ~idx; // bitwise not: standard "negative insertion index" convention
  if (insertPos === 0 || insertPos === n) {
    // Shouldn't happen due to range check, but keep safe.
    return null;
  }
  const t0 = TS[insertPos - 1], t1 = TS[insertPos];
  const p0 = PRICES[insertPos - 1], p1 = PRICES[insertPos];

  // Linear interpolation
  const alpha = (tSec - t0) / (t1 - t0);
  return p0 + alpha * (p1 - p0);
}

/**
 * Binary search over sorted numeric array.
 * @param {number[]} arr - Sorted ascending.
 * @param {number} x - Value to find.
 * @returns {number} Index if found; otherwise bitwise-not (~) insertion index.
 */
function binarySearch(arr: number[], x: number): number {
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >>> 1;
    const v = arr[mid];
    if (v === x) return mid;
    if (v < x) lo = mid + 1;
    else hi = mid - 1;
  }
  return ~lo; // not found -> bitwise-not insertion point
}

/**
 * Build 30-record rolling correlation series between daily mean price diff
 * and EUR/USD one-day % change (from fxOneDayPercentChange).
 *
 * Lag definition: corr(priceDiff[t], fxChange[t - k]) for k in {0,1,2}.
 * All day buckets are UTC days (00:00:00Z).
 */
function buildDailyFxCorrelations(executions: any[], contract: string, windowSize = 30) {
  // 1) Filter by contract
  const filtered = executions.filter((e: any) => e.contract === contract);

  // 2) Per-execution % diff and bucket by UTC day
  //    dayKey = YYYY-MM-DD; daySec = Unix seconds at 00:00:00Z
  const dayBuckets = new Map(); // daySec -> { sumDiff, count }
  for (const e of filtered) {
    if (
      e == null ||
      typeof e.price_estimated !== "number" ||
      typeof e.price_executed !== "number" ||
      !isFinite(e.price_estimated) ||
      e.price_estimated === 0
    ) continue;

    const tSec = toUnixSeconds(e.timestamp);
    if (tSec == null) continue;

    const daySec = dayStartUnixSeconds(tSec);
    const pdiff = (e.price_executed - e.price_estimated) / e.price_estimated;

    const prev = dayBuckets.get(daySec);
    if (prev) {
      prev.sumDiff += pdiff;
      prev.count += 1;
    } else {
      dayBuckets.set(daySec, { sumDiff: pdiff, count: 1 });
    }
  }

  // 3) Aggregate by day (mean), sorted by daySec
  const rows = Array.from(dayBuckets.entries())
    .map(([daySec, { sumDiff, count }]: [number, any]) => ({
      daySec,
      dayISO: toISODate(daySec),
      meanDiff: sumDiff / count
    }))
    .sort((a, b) => a.daySec - b.daySec);

  // 4) For each day, compute EUR/USD one-day % change
  const withFx = rows
    .map(r => ({
      ...r,
      fxChange: fxOneDayPercentChange(r.daySec)
    }))
    .filter(r => r.fxChange != null && isFinite(r.fxChange) && isFinite(r.meanDiff));

  // If not enough data for rolling window + max lag, return empty series
  const maxLag = 2;
  if (withFx.length < windowSize + maxLag) {
    return { days: [], corrLag0: [], corrLag1: [], corrLag2: [] };
  }

  const days: string[] = [];
  const corrLag0: (number | null)[] = [];
  const corrLag1: (number | null)[] = [];
  const corrLag2: (number | null)[] = [];

  // 5) Rolling correlations
  for (let i = windowSize - 1 + maxLag; i < withFx.length; i++) {
    const start = i - (windowSize - 1);
    const end = i; // inclusive

    // Window slices for priceDiff
    const x = sliceValues(withFx, start, end, "meanDiff");

    // Lag 0: fx aligned
    const y0 = sliceValues(withFx, start, end, "fxChange");

    // Lag 1: fx shifted back by 1
    const y1 = (start - 1 >= 0) ? sliceValues(withFx, start - 1, end - 1, "fxChange") : null;

    // Lag 2: fx shifted back by 2
    const y2 = (start - 2 >= 0) ? sliceValues(withFx, start - 2, end - 2, "fxChange") : null;

    const dISO = withFx[i].dayISO;

    days.push(dISO);
    corrLag0.push((y0 && x) ? pearsonCorr(x, y0) : null);
    corrLag1.push((y1 && x) ? pearsonCorr(x, y1) : null);
    corrLag2.push((y2 && x) ? pearsonCorr(x, y2) : null);
  }

  return { days, corrLag0, corrLag1, corrLag2 };

  // ===== helpers =====
  function toUnixSeconds(ts: any): number | null {
    try {
      if (typeof ts === "number") {
        return ts > 1e12 ? Math.floor(ts / 1000) : Math.floor(ts);
      }
      const d = new Date(ts);
      const ms = d.getTime();
      if (!isFinite(ms)) return null;
      return Math.floor(ms / 1000);
    } catch {
      return null;
    }
  }

  function dayStartUnixSeconds(tSec: number): number {
    const DAY = 86400;
    return Math.floor(tSec / DAY) * DAY;
  }

  function toISODate(daySec: number): string {
    const d = new Date(daySec * 1000);
    const yyyy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
    const dd = String(d.getUTCDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  function sliceValues(arr: any[], startIdx: number, endIdx: number, key: string): number[] | null {
    if (startIdx < 0 || endIdx >= arr.length || startIdx > endIdx) return null;
    const out = new Array(endIdx - startIdx + 1);
    for (let i = startIdx, j = 0; i <= endIdx; i++, j++) {
      const v = arr[i][key];
      if (v == null || !isFinite(v)) return null;
      out[j] = v;
    }
    return out;
  }

  function pearsonCorr(a: number[], b: number[]): number | null {
    const n = a.length;
    if (!b || b.length !== n || n < 2) return null;

    // mean
    let sx = 0, sy = 0;
    for (let i = 0; i < n; i++) { sx += a[i]; sy += b[i]; }
    const mx = sx / n, my = sy / n;

    // covariance and variances (sample)
    let sxx = 0, syy = 0, sxy = 0;
    for (let i = 0; i < n; i++) {
      const dx = a[i] - mx;
      const dy = b[i] - my;
      sxx += dx * dx;
      syy += dy * dy;
      sxy += dx * dy;
    }
    if (sxx === 0 || syy === 0) return null;
    return sxy / Math.sqrt(sxx * syy);
  }
}

interface CorrelationData {
    date: string;
    correlation0Day: number;
    correlation1Day: number;
    correlation2Day: number;
}

const CorrelationTimelineChart: React.FC<CorrelationTimelineChartProps> = ({ 
    trades, 
    height = 300, 
    title 
}) => {
    const [timeFrame, setTimeFrame] = useState<number>(5); // Default 30 days
    const [visibleLines, setVisibleLines] = useState({
        day0: true,
        day1: true,
        day2: true
    });

    const completedTrades = trades.filter(trade => trade.status === 'completed');

    // Convert MetalTrade to the format expected by buildDailyFxCorrelations
    const convertedTrades = completedTrades.map(trade => ({
        timestamp: trade.timestamp,
        contract: trade.metal.toUpperCase(), // Use metal as contract, uppercase to match
        price_estimated: trade.riskPrice,
        price_executed: trade.actualSalePrice,
        client: trade.client || 'Unknown'
    }));

    // Calculate correlations using the new function
    const calculateCorrelationData = (): CorrelationData[] => {
        if (convertedTrades.length === 0) return [];

        // Get unique metals/contracts from trades
        const contracts = [...new Set(convertedTrades.map(t => t.contract))];
        
        // For now, use the first contract or 'COPPER' as default
        const targetContract = contracts.includes('COPPER') ? 'COPPER' : contracts[0];
        
        if (!targetContract) return [];

        const correlationResult = buildDailyFxCorrelations(convertedTrades, targetContract, timeFrame);
        
        // Convert the result to CorrelationData format, filtering out invalid data
        const correlationData: CorrelationData[] = correlationResult.days
            .map((date, index) => {
                const corr0 = correlationResult.corrLag0[index];
                const corr1 = correlationResult.corrLag1[index];
                const corr2 = correlationResult.corrLag2[index];
                
                return {
                    date,
                    correlation0Day: (corr0 !== null && isFinite(corr0)) ? corr0 : 0,
                    correlation1Day: (corr1 !== null && isFinite(corr1)) ? corr1 : 0,
                    correlation2Day: (corr2 !== null && isFinite(corr2)) ? corr2 : 0
                };
            })
            .filter(d => 
                isFinite(d.correlation0Day) || 
                isFinite(d.correlation1Day) || 
                isFinite(d.correlation2Day)
            );

        console.log('Generated correlation data points:', correlationData.length);
        console.log('Using contract:', targetContract);
        console.log('Available trades for correlation:', convertedTrades.length);
        
        return correlationData;
    };

    const correlationData = calculateCorrelationData();
    
    // Debug logging
    if (correlationData.length > 0) {
        console.log('Correlation data sample:', correlationData.slice(0, 3));
        console.log('Correlation ranges:', {
            day0: { min: Math.min(...correlationData.map(d => d.correlation0Day)), max: Math.max(...correlationData.map(d => d.correlation0Day)) },
            day1: { min: Math.min(...correlationData.map(d => d.correlation1Day)), max: Math.max(...correlationData.map(d => d.correlation1Day)) },
            day2: { min: Math.min(...correlationData.map(d => d.correlation2Day)), max: Math.max(...correlationData.map(d => d.correlation2Day)) }
        });
    }
    
    // Chart dimensions and scaling
    const chartWidth = 600;
    const chartHeight = 200;
    const marginLeft = 50;
    const marginRight = 50;
    const plotWidth = chartWidth - marginLeft - marginRight;

    const scaleX = (index: number) => {
        if (correlationData.length <= 1) return chartWidth / 2;
        return marginLeft + (index / (correlationData.length - 1)) * plotWidth;
    };

    const scaleY = (correlation: number) => {
        // Map correlation from [-1, 1] to [chartHeight - 20, 20]
        return 20 + ((1 - correlation) / 2) * (chartHeight - 40);
    };

    const toggleLine = (line: keyof typeof visibleLines) => {
        setVisibleLines(prev => ({ ...prev, [line]: !prev[line] }));
    };

    const lineConfigs = [
        { key: 'day0' as const, color: 'var(--color-primary-500)', label: '0-Day Lag', dataKey: 'correlation0Day' as const },
        { key: 'day1' as const, color: 'var(--color-warning-500)', label: '1-Day Lag', dataKey: 'correlation1Day' as const },
        { key: 'day2' as const, color: 'var(--color-success-500)', label: '2-Day Lag', dataKey: 'correlation2Day' as const }
    ];

    return (
        <div className="correlation_timeline_chart_container chart_container" style={{ height }}>
            <div className="correlation_timeline_chart_header chart_header">
                <h3 className="correlation_timeline_chart_title chart_title">{title}</h3>
                <div className="correlation_timeline_controls" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                    
                    <div className="correlation_timeline_chart_legend chart_legend">
                        {lineConfigs.map(config => (
                            <span 
                                key={config.key}
                                className={`correlation_timeline_legend_item chart_legend_item ${!visibleLines[config.key] ? 'disabled' : ''}`}
                                onClick={() => toggleLine(config.key)}
                                style={{ cursor: 'pointer' }}
                            >
                                <span 
                                    className="correlation_timeline_legend_line"
                                    style={{ 
                                        backgroundColor: visibleLines[config.key] ? config.color : 'var(--color-text-tertiary)',
                                        opacity: visibleLines[config.key] ? 1 : 0.3
                                    }}
                                ></span>
                                {config.label}
                            </span>
                        ))}
                        {/* <span className="correlation_timeline_legend_item chart_legend_item">
                            <span className="correlation_timeline_legend_line" style={{ backgroundColor: 'var(--color-success-500)', width: '16px', height: '3px' }}></span>
                            Above 0: Positive
                        </span>
                        <span className="correlation_timeline_legend_item chart_legend_item">
                            <span className="correlation_timeline_legend_line" style={{ backgroundColor: 'var(--color-danger-500)', width: '16px', height: '3px' }}></span>
                            Below 0: Negative
                        </span>
                        <span className="correlation_timeline_legend_item chart_legend_item">
                            <span className="correlation_timeline_legend_line" style={{ backgroundColor: 'var(--color-text-tertiary)', width: '16px', height: '3px' }}></span>
                            At 0: No Correlation
                        </span> */}
                        <div className="correlation_timeframe_control" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <label style={{ fontSize: '14px', fontWeight: '500', color: 'var(--color-text-secondary)' }}>Time Frame:</label>
                        <select 
                            value={timeFrame} 
                            onChange={(e) => setTimeFrame(parseInt(e.target.value))}
                            className="correlation-timeframe-select"
                        >
                            <option value={5}>5 Days</option>
                            <option value={14}>14 Days</option>
                            <option value={30}>30 Days</option>
                            <option value={60}>60 Days</option>
                            <option value={90}>90 Days</option>
                        </select>
                    </div>
                    </div>
                </div>
            </div>
            <div className="correlation_timeline_chart_content chart_content">
                <div className="correlation_timeline_main_area">
                    <div className="correlation_timeline_y_axis chart_y_axis">
                        <span className="correlation_timeline_y_label chart_y_label">+1.0</span>
                        <span className="correlation_timeline_y_label chart_y_label">+0.5</span>
                        <span className="correlation_timeline_y_label chart_y_label">0.0</span>
                        <span className="correlation_timeline_y_label chart_y_label">-0.5</span>
                        <span className="correlation_timeline_y_label chart_y_label">-1.0</span>
                    </div>
                    <div className="correlation_timeline_chart_area chart_area">
                        <svg className="correlation_timeline_svg chart_svg" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                            {/* Grid lines */}
                            <g className="correlation_timeline_grid chart_grid">
                                {/* Horizontal reference lines */}
                                <line x1={marginLeft} y1={scaleY(1)} x2={chartWidth - marginRight} y2={scaleY(1)} className="grid_line" opacity="0.3"/>
                                <line x1={marginLeft} y1={scaleY(0.75)} x2={chartWidth - marginRight} y2={scaleY(0.75)} className="grid_line" opacity="0.2"/>
                                <line x1={marginLeft} y1={scaleY(0.5)} x2={chartWidth - marginRight} y2={scaleY(0.5)} className="grid_line" opacity="0.3"/>
                                <line x1={marginLeft} y1={scaleY(0)} x2={chartWidth - marginRight} y2={scaleY(0)} className="major_line"/>
                                <line x1={marginLeft} y1={scaleY(-0.5)} x2={chartWidth - marginRight} y2={scaleY(-0.5)} className="grid_line" opacity="0.3"/>
                                <line x1={marginLeft} y1={scaleY(-0.75)} x2={chartWidth - marginRight} y2={scaleY(-0.75)} className="grid_line" opacity="0.2"/>
                                <line x1={marginLeft} y1={scaleY(-1)} x2={chartWidth - marginRight} y2={scaleY(-1)} className="grid_line" opacity="0.3"/>
                                
                                {/* Critical threshold bands */}
                                {/* <rect 
                                    x={marginLeft} 
                                    y={scaleY(1)} 
                                    width={plotWidth} 
                                    height={scaleY(0.7) - scaleY(1)}
                                    fill="var(--color-success-500)" 
                                    opacity="0.1"
                                />
                                <rect 
                                    x={marginLeft} 
                                    y={scaleY(-0.7)} 
                                    width={plotWidth} 
                                    height={scaleY(-1) - scaleY(-0.7)}
                                    fill="var(--color-danger-500)" 
                                    opacity="0.1"
                                /> */}
                            </g>

                            {/* Correlation lines */}
                            {correlationData.length > 0 && lineConfigs.map(config => {
                                if (!visibleLines[config.key]) return null;
                                
                                const pathData = correlationData.map((d, i) => {
                                    const x = scaleX(i);
                                    const y = scaleY(d[config.dataKey]);
                                    return `${i === 0 ? 'M' : 'L'} ${x} ${Math.max(20, Math.min(chartHeight - 20, y))}`;
                                }).join(' ');

                                return (
                                    <g key={config.key}>
                                        <path
                                            d={pathData}
                                            stroke={config.color}
                                            strokeWidth="2"
                                            fill="none"
                                            className="correlation_timeline_line"
                                        />
                                        {/* Data points */}
                                        {correlationData.map((d, i) => {
                                            const x = scaleX(i);
                                            const y = Math.max(20, Math.min(chartHeight - 20, scaleY(d[config.dataKey])));
                                            return (
                                                <circle
                                                    key={i}
                                                    cx={x}
                                                    cy={y}
                                                    r="3"
                                                    fill={config.color}
                                                    className="correlation_timeline_point chart_point"
                                                >
                                                    <title>
                                                        {`${d.date}: ${config.label} Correlation = ${d[config.dataKey].toFixed(3)}`}
                                                    </title>
                                                </circle>
                                            );
                                        })}
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
                <div className="correlation_timeline_x_axis chart_x_axis">
                    {correlationData.length > 0 && correlationData.filter((_, i) => i % Math.ceil(correlationData.length / 5) === 0).map((d, i) => {
                        const actualIndex = i * Math.ceil(correlationData.length / 5);
                        const position = `${5 + (actualIndex / (correlationData.length - 1)) * 90}%`;
                        const displayDate = new Date(d.date + 'T00:00:00');
                        return (
                            <span 
                                key={i} 
                                className="correlation_timeline_x_label chart_x_label"
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

export default CorrelationTimelineChart;
