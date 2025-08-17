import React, { useState, useMemo } from 'react';
import './ClusteringGraph.css';

// Transaction data structure
interface Transaction {
  id: string;
  contractType: string;
  contractMonth: string;
  price: number;
  client: string;
  salesPerson: string;
  dateOfExecution: string;
}

// Cluster point interface
interface ClusterPoint {
  id: string;
  x: number;
  y: number;
  radius: number;
  color: string;
  risk: 'low' | 'medium' | 'high';
  count: number;
  transactions: Transaction[];
}

const ClusteringGraph: React.FC = () => {
  const [selectedCluster, setSelectedCluster] = useState<string | null>(null);
  const [tooltipInfo, setTooltipInfo] = useState<{visible: boolean, x: number, y: number, cluster: ClusterPoint | null}>(
    {visible: false, x: 0, y: 0, cluster: null}
  );
  
  // Generate random cluster data for demo purposes
  const clusterData = useMemo(() => {
    const riskColors = {
      low: 'var(--success-500)',
      medium: 'var(--warning-500)',
      high: 'var(--danger-500)'
    };
    
    const generateRandomTransactions = (count: number, risk: 'low' | 'medium' | 'high'): Transaction[] => {
      const contractTypes = ['Futures', 'Options', 'Swaps', 'Forwards'];
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const clients = ['Acme Corp', 'Globex', 'Initech', 'Umbrella Corp', 'Wayne Enterprises'];
      const salesPeople = ['John Smith', 'Jane Doe', 'David Johnson', 'Sarah Williams', 'Michael Brown'];
      
      return Array.from({ length: count }, (_, i) => ({
        id: `trans-${risk}-${i}`,
        contractType: contractTypes[Math.floor(Math.random() * contractTypes.length)],
        contractMonth: months[Math.floor(Math.random() * months.length)],
        price: Math.floor(Math.random() * 10000) / 100 + 50,
        client: clients[Math.floor(Math.random() * clients.length)],
        salesPerson: salesPeople[Math.floor(Math.random() * salesPeople.length)],
        dateOfExecution: new Date(Date.now() - Math.floor(Math.random() * 30) * 86400000).toISOString().split('T')[0]
      }));
    };
    
    return [
      {
        id: 'cluster-1',
        x: 80,
        y: 120,
        radius: 35,
        color: riskColors.low,
        risk: 'low' as const,
        count: 42,
        transactions: generateRandomTransactions(42, 'low')
      },
      {
        id: 'cluster-2',
        x: 220,
        y: 150,
        radius: 28,
        color: riskColors.medium,
        risk: 'medium' as const,
        count: 28,
        transactions: generateRandomTransactions(28, 'medium')
      },
      {
        id: 'cluster-3',
        x: 350,
        y: 80,
        radius: 20,
        color: riskColors.high,
        risk: 'high' as const,
        count: 15,
        transactions: generateRandomTransactions(15, 'high')
      },
      {
        id: 'cluster-4',
        x: 180,
        y: 60,
        radius: 25,
        color: riskColors.medium,
        risk: 'medium' as const,
        count: 23,
        transactions: generateRandomTransactions(23, 'medium')
      },
      {
        id: 'cluster-5',
        x: 300,
        y: 180,
        radius: 18,
        color: riskColors.high,
        risk: 'high' as const,
        count: 12,
        transactions: generateRandomTransactions(12, 'high')
      }
    ];
  }, []);
  
  const handleClusterClick = (cluster: ClusterPoint) => {
    setSelectedCluster(selectedCluster === cluster.id ? null : cluster.id);
    // This would be where you'd handle navigating to transactions or showing details
  };
  
  const handleClusterMouseEnter = (event: React.MouseEvent, cluster: ClusterPoint) => {
    setTooltipInfo({
      visible: true,
      x: event.nativeEvent.offsetX,
      y: event.nativeEvent.offsetY,
      cluster
    });
  };
  
  const handleClusterMouseLeave = () => {
    setTooltipInfo(prev => ({ ...prev, visible: false }));
  };
  
  return (
    <div className="clustering-graph-container">
      <div className="clustering-graph-header">
        <h3>Transaction Clusters</h3>
        <div className="clustering-graph-legend">
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--success-500)' }}></span>
            <span className="legend-label">Low Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--warning-500)' }}></span>
            <span className="legend-label">Medium Risk</span>
          </div>
          <div className="legend-item">
            <span className="legend-color" style={{ backgroundColor: 'var(--danger-500)' }}></span>
            <span className="legend-label">High Risk</span>
          </div>
        </div>
      </div>
      <div className="clustering-graph-canvas">
        <svg width="430" height="240" viewBox="0 0 430 240">
          <defs>
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Grid lines */}
          {Array.from({ length: 6 }).map((_, i) => (
            <line 
              key={`h-line-${i}`}
              x1="0" 
              y1={i * 40} 
              x2="430" 
              y2={i * 40}
              stroke="var(--gray-200)"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}
          {Array.from({ length: 11 }).map((_, i) => (
            <line 
              key={`v-line-${i}`}
              x1={i * 40} 
              y1="0" 
              x2={i * 40} 
              y2="240"
              stroke="var(--gray-200)"
              strokeWidth="1"
              strokeDasharray="4"
            />
          ))}
          
          {/* Clusters */}
          {clusterData.map(cluster => (
            <g 
              key={cluster.id} 
              onClick={() => handleClusterClick(cluster)}
              onMouseEnter={(e) => handleClusterMouseEnter(e, cluster)}
              onMouseLeave={handleClusterMouseLeave}
              className="cluster-point"
              style={{ cursor: 'pointer' }}
            >
              <circle 
                cx={cluster.x} 
                cy={cluster.y} 
                r={cluster.radius}
                fill={cluster.color}
                fillOpacity="0.25"
                stroke={cluster.color}
                strokeWidth="2"
                style={{ filter: selectedCluster === cluster.id ? 'url(#glow)' : 'none' }}
              />
              <text 
                x={cluster.x} 
                y={cluster.y} 
                textAnchor="middle" 
                dy="5" 
                fill="var(--text-color-primary)" 
                fontWeight="600"
              >
                {cluster.count}
              </text>
            </g>
          ))}
        </svg>
        
        {tooltipInfo.visible && tooltipInfo.cluster && (
          <div 
            className="cluster-tooltip" 
            style={{ 
              position: 'absolute', 
              left: tooltipInfo.x + 10, 
              top: tooltipInfo.y + 10,
              backgroundColor: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-md)',
              padding: '8px 12px',
              borderRadius: '4px',
              zIndex: 10
            }}
          >
            <div className="tooltip-header">
              <span className="tooltip-risk" style={{ color: tooltipInfo.cluster.color }}>
                {tooltipInfo.cluster.risk.charAt(0).toUpperCase() + tooltipInfo.cluster.risk.slice(1)} Risk
              </span>
              <span className="tooltip-count">{tooltipInfo.cluster.count} Transactions</span>
            </div>
            <div className="tooltip-info">
              Click to view transaction details
            </div>
          </div>
        )}
      </div>
      <div className="clustering-graph-info">
        <p>Clusters represent groups of similar transactions based on risk profile and pattern analysis.</p>
      </div>
    </div>
  );
};

export default ClusteringGraph;
