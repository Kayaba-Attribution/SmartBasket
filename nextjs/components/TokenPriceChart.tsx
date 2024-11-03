// components/TokenPriceChart.tsx
import React, { useEffect, useRef, useState } from "react";
import { ColorType, IChartApi, createChart } from "lightweight-charts";

interface PriceData {
  timestamp: number;
  price: string;
}

interface ApiResponse {
  success: boolean;
  results: PriceData[];
}

interface TokenPriceChartProps {
  tokenAddress: string;
  chainId?: number;
  timeframe?: string;
}

export const TokenPriceChart: React.FC<TokenPriceChartProps> = ({ tokenAddress, chainId = 1, timeframe = "24h" }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<IChartApi | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(
          `https://price-monitoring-hono.smart-portfolio-price-monitor.workers.dev/api/prices/${chainId}/${tokenAddress}/history?timeframe=${timeframe}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch price data");
        }

        const data: ApiResponse = await response.json();

        if (!data.success || !data.results?.length) {
          throw new Error("No price data available");
        }

        if (chartContainerRef.current) {
          // Initialize chart if not already done
          if (!chart.current) {
            chart.current = createChart(chartContainerRef.current, {
              layout: {
                background: { type: ColorType.Solid, color: "transparent" },
                textColor: "#64748b",
              },
              grid: {
                vertLines: { color: "#334155" },
                horzLines: { color: "#334155" },
              },
              width: chartContainerRef.current.clientWidth,
              height: 300,
              timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: "#334155",
              },
              rightPriceScale: {
                borderColor: "#334155",
              },
              crosshair: {
                vertLine: {
                  labelBackgroundColor: "#475569",
                },
                horzLine: {
                  labelBackgroundColor: "#475569",
                },
              },
            });
          }

          // Create and style the area series
          const areaSeries = chart.current.addAreaSeries({
            lineColor: "#4ade80",
            topColor: "rgba(74, 222, 128, 0.4)",
            bottomColor: "rgba(74, 222, 128, 0)",
            lineWidth: 2,
            priceFormat: {
              type: "price",
              precision: 6,
              minMove: 0.000001,
            },
          });

          // Format the data
          const formattedData = data.results.map(item => ({
            time: item.timestamp as number,
            value: parseFloat(item.price),
          }));

          // Set the data and fit content
          areaSeries.setData(formattedData);
          chart.current.timeScale().fitContent();

          // Handle resize
          const handleResize = () => {
            if (chartContainerRef.current && chart.current) {
              chart.current.applyOptions({
                width: chartContainerRef.current.clientWidth,
              });
            }
          };

          window.addEventListener("resize", handleResize);
          return () => {
            window.removeEventListener("resize", handleResize);
            if (chart.current) {
              chart.current.remove();
              chart.current = null;
            }
          };
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load chart data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tokenAddress, chainId, timeframe]);

  if (isLoading) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="h-[300px] flex items-center justify-center">
            <div className="loading loading-spinner loading-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card w-full bg-base-100 shadow-xl">
        <div className="card-body">
          <div className="h-[300px] flex items-center justify-center text-error">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="card w-full bg-base-100 shadow-xl">
      <div className="card-body">
        <h2 className="card-title">Price History</h2>
        <div className="w-full h-[300px]" ref={chartContainerRef} />
      </div>
    </div>
  );
};

export default TokenPriceChart;
