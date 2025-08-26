import React from 'react';
import { type MetalTrade } from '../../hooks/useMetalTrades';
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
    
    // Group trades by week and calculate weekly P&L
    const weeklyPL = completedTrades.reduce((acc, trade) => {
        const date = new Date(trade.timestamp);
        const weekStart = new Date(date.setDate(date.getDate() - date.getDay()));
        const weekKey = weekStart.toLocaleDateString();
        
        if (!acc[weekKey]) {
            acc[weekKey] = { totalPL: 0, count: 0, date: weekStart };
        }
        acc[weekKey].totalPL += trade.profitLoss;
        acc[weekKey].count += 1;
        return acc;
    }, {} as Record<string, { totalPL: number; count: number; date: Date }>);

    const chartData = Object.entries(weeklyPL)
        .map(([week, data]) => ({
            week,
            totalPL: data.totalPL,
            count: data.count,
            date: data.date
        }))
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .slice(-8); // Last 8 weeks

    const maxPL = Math.max(...chartData.map(d => Math.abs(d.totalPL)));

    return (
        <div className="profit_loss_chart_container" style={{ height }}>
            <div className="profit_loss_chart_header">
                <h3 className="profit_loss_chart_title">{title}</h3>
                <div className="profit_loss_chart_legend">
                    <span className="profit_loss_legend_item profit">
                        <span className="profit_loss_legend_bar profit"></span>
                        Profit
                    </span>
                    <span className="profit_loss_legend_item loss">
                        <span className="profit_loss_legend_bar loss"></span>
                        Loss
                    </span>
                </div>
            </div>
            <div className="profit_loss_chart_content">
                <div className="profit_loss_bars">
                    {chartData.map((data, index) => (
                        <div key={index} className="profit_loss_bar_group">
                            <div className="profit_loss_bar_container">
                                <div 
                                    className={`profit_loss_bar ${data.totalPL >= 0 ? 'profit' : 'loss'}`}
                                    style={{
                                        height: `${(Math.abs(data.totalPL) / maxPL) * 80}%`,
                                        transform: data.totalPL < 0 ? 'scaleY(-1)' : 'none'
                                    }}
                                    title={`Week of ${data.date.toLocaleDateString()}: $${data.totalPL.toFixed(2)} (${data.count} trades)`}
                                >
                                    <span className="profit_loss_value">
                                        ${data.totalPL > 0 ? '+' : ''}${(data.totalPL / 1000).toFixed(1)}k
                                    </span>
                                </div>
                            </div>
                            <div className="profit_loss_label">
                                <span className="profit_loss_week">
                                    {data.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="profit_loss_count">
                                    {data.count} trades
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="profit_loss_zero_line"></div>
            </div>
        </div>
    );
};

export default ProfitLossChart;
