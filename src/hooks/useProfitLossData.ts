import { useQuery } from '@tanstack/react-query';

export type ProfitLossDataPoint = {
  id: string;
  traderId: string;
  value: number;
  date: string;
  contractType: string;
};

export type BoxPlotData = {
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
  outliers: ProfitLossDataPoint[];
  totalSample: number;
};

export type ProfitLossData = {
  perTrade: BoxPlotData;
  perYear: BoxPlotData;
};

// Generate random data for boxplot
const generateRandomProfitLossData = (): ProfitLossData => {
  // Generate random P&L per trade
  const tradeSampleSize = 100;
  const tradeValues: number[] = [];
  const tradeOutliers: ProfitLossDataPoint[] = [];

  // Generate base data points
  for (let i = 0; i < tradeSampleSize; i++) {
    // Generate mostly in range -100 to 300 with normal distribution
    const value = Math.round((Math.random() + Math.random() + Math.random() - 1.5) * 200);
    tradeValues.push(value);
    
    // Add some outliers
    if (i % 30 === 0) {
      const outlierValue = Math.random() < 0.5 ? -500 - Math.random() * 500 : 1000 + Math.random() * 2000;
      const outlierId = `trade-outlier-${i}`;
      
      tradeOutliers.push({
        id: outlierId,
        traderId: `trader-${Math.floor(Math.random() * 10)}`,
        value: outlierValue,
        date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        contractType: ['Futures', 'Options', 'Swaps', 'Forwards'][Math.floor(Math.random() * 4)],
      });
    }
  }

  // Sort values for quartile calculation
  tradeValues.sort((a, b) => a - b);

  // Calculate quartiles for per trade
  const tradeMin = Math.min(...tradeValues);
  const tradeMax = Math.max(...tradeValues);
  const tradeQ1 = tradeValues[Math.floor(tradeSampleSize * 0.25)];
  const tradeMedian = tradeValues[Math.floor(tradeSampleSize * 0.5)];
  const tradeQ3 = tradeValues[Math.floor(tradeSampleSize * 0.75)];

  // Generate yearly data (slightly different distribution)
  const yearSampleSize = 20; // 20 traders
  const yearValues: number[] = [];
  const yearOutliers: ProfitLossDataPoint[] = [];

  // Generate yearly P&L data
  for (let i = 0; i < yearSampleSize; i++) {
    // Generate values in a different range for yearly data (thousands)
    const value = Math.round((Math.random() + Math.random() + Math.random() - 1.5) * 20000);
    yearValues.push(value);
    
    // Add some outliers for yearly data
    if (i % 10 === 0) {
      const outlierValue = Math.random() < 0.5 ? -50000 - Math.random() * 30000 : 100000 + Math.random() * 200000;
      const outlierId = `year-outlier-${i}`;
      
      yearOutliers.push({
        id: outlierId,
        traderId: `trader-${Math.floor(Math.random() * 10)}`,
        value: outlierValue,
        date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        contractType: ['Futures', 'Options', 'Swaps', 'Forwards'][Math.floor(Math.random() * 4)],
      });
    }
  }

  // Sort values for quartile calculation
  yearValues.sort((a, b) => a - b);

  // Calculate quartiles for per year
  const yearMin = Math.min(...yearValues);
  const yearMax = Math.max(...yearValues);
  const yearQ1 = yearValues[Math.floor(yearSampleSize * 0.25)];
  const yearMedian = yearValues[Math.floor(yearSampleSize * 0.5)];
  const yearQ3 = yearValues[Math.floor(yearSampleSize * 0.75)];

  return {
    perTrade: {
      min: tradeMin,
      q1: tradeQ1,
      median: tradeMedian,
      q3: tradeQ3,
      max: tradeMax,
      outliers: tradeOutliers,
      totalSample: tradeSampleSize
    },
    perYear: {
      min: yearMin,
      q1: yearQ1,
      median: yearMedian,
      q3: yearQ3,
      max: yearMax,
      outliers: yearOutliers,
      totalSample: yearSampleSize
    }
  };
};

export function useProfitLossData() {
  return useQuery({
    queryKey: ['profitLossData'],
    queryFn: async (): Promise<ProfitLossData> => {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Simulate API delay
      return generateRandomProfitLossData();
    },
    staleTime: 60_000, // 1 minute
  });
}
