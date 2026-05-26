import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

interface ChartDataPoint {
  day: string;
  completedCount: number;
}

interface D3ProgressChartProps {
  currentTheme: 'parchment' | 'space';
  completedCount: number;
}

export default function D3ProgressChart({ currentTheme, completedCount }: D3ProgressChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isSpace = currentTheme === 'space';
  const [hoveredPoint, setHoveredPoint] = useState<ChartDataPoint | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Generate deterministic progress history mapping up to 7 days ago
  const generateProgressData = (): ChartDataPoint[] => {
    // 7-day window ending today, May 26, 2026
    const days = ['May 20', 'May 21', 'May 22', 'May 23', 'May 24', 'May 25', 'May 26'];
    
    // Distribute completedCount over the days deterministically for smooth progress curve
    const curveDistribution = [
      0, // May 20
      Math.min(completedCount, 1) === 1 ? 1 : 0, // May 21
      Math.min(completedCount, 2) >= 1 ? 1 : 0, // May 22
      Math.min(completedCount, 2) >= 2 ? 2 : Math.min(completedCount, 1), // May 23
      Math.min(completedCount, 3) >= 2 ? 2 : Math.min(completedCount, 2), // May 24
      Math.min(completedCount, 3) >= 3 ? 3 : Math.min(completedCount, 2), // May 25
      completedCount // May 26 (Today)
    ];

    return days.map((day, idx) => ({
      day,
      completedCount: curveDistribution[idx],
    }));
  };

  const data = generateProgressData();

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous elements
    d3.select(svgRef.current).selectAll('*').remove();

    // Get parent div bounding dimensions
    const width = containerRef.current.clientWidth || 500;
    const height = 180;
    const margin = { top: 15, right: 20, bottom: 25, left: 25 };

    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    // Axes scale generators
    const xScale = d3.scalePoint()
      .domain(data.map(d => d.day))
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 4]) // Max lessons has 4
      .range([height - margin.bottom, margin.top]);

    // Theme values configuration
    const lineColor = isSpace ? '#C9933A' : '#8B0000'; // gold vs crimson
    const accentColor = isSpace ? '#4ade80' : '#16a34a'; // green progress
    const textColor = isSpace ? 'rgba(255, 255, 255, 0.4)' : '#6b7280';
    const gridColor = isSpace ? 'rgba(201, 147, 58, 0.1)' : 'rgba(139, 0, 0, 0.06)';

    // Gradient definition for area fill
    const defs = svg.append('defs');
    const areaGradient = defs.append('linearGradient')
      .attr('id', 'area-grad')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    if (isSpace) {
      areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#C9933A')
        .attr('stop-opacity', '0.25');
      areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#C9933A')
        .attr('stop-opacity', '0.0');
    } else {
      areaGradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#8B0000')
        .attr('stop-opacity', '0.15');
      areaGradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#8B0000')
        .attr('stop-opacity', '0.00');
    }

    // Gridlines drawing
    svg.append('g')
      .attr('class', 'grid-lines')
      .selectAll('line')
      .data(yScale.ticks(4))
      .enter()
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', width - margin.right)
      .attr('y1', d => yScale(d))
      .attr('y2', d => yScale(d))
      .attr('stroke', gridColor)
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '2,4');

    // Custom formatting for Axes
    const xAxisLabel = svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).tickSize(3))
      .call(g => g.select('.domain').attr('stroke', gridColor))
      .call(g => g.selectAll('line').attr('stroke', gridColor));

    xAxisLabel.selectAll('text')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '8px')
      .attr('fill', textColor);

    const yAxisLabel = svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(d3.format('d')).tickSize(3))
      .call(g => g.select('.domain').attr('stroke', gridColor))
      .call(g => g.selectAll('line').attr('stroke', gridColor));

    yAxisLabel.selectAll('text')
      .style('font-family', 'ui-monospace, monospace')
      .style('font-size', '8px')
      .attr('fill', textColor);

    // Line and Area Generators
    const areaGenerator = d3.area<ChartDataPoint>()
      .x(d => xScale(d.day) || 0)
      .y0(height - margin.bottom)
      .y1(d => yScale(d.completedCount))
      .curve(d3.curveMonotoneX);

    const lineGenerator = d3.line<ChartDataPoint>()
      .x(d => xScale(d.day) || 0)
      .y(d => yScale(d.completedCount))
      .curve(d3.curveMonotoneX);

    // Render Gradient Area
    svg.append('path')
      .datum(data)
      .attr('class', 'area')
      .attr('d', areaGenerator)
      .attr('fill', 'url(#area-grad)');

    // Render Progress Line
    svg.append('path')
      .datum(data)
      .attr('class', 'line')
      .attr('d', lineGenerator)
      .attr('fill', 'none')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2);

    // Interaction nodes & Tooltip hover handlers
    const interactionGroup = svg.append('g').attr('class', 'interaction-nodes');

    interactionGroup.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.day) || 0)
      .attr('cy', d => yScale(d.completedCount))
      .attr('r', 3.5)
      .attr('fill', isSpace ? '#141416' : '#ffffff')
      .attr('stroke', lineColor)
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 6.5)
          .attr('fill', lineColor);
        
        const coords = d3.pointer(event, svgRef.current);
        setTooltipPos({ x: coords[0] - 50, y: coords[1] - 45 });
        setHoveredPoint(d);
      })
      .on('mouseleave', function () {
        d3.select(this)
          .transition()
          .duration(150)
          .attr('r', 3.5)
          .attr('fill', isSpace ? '#141416' : '#ffffff');
        
        setHoveredPoint(null);
      });

  }, [completedCount, currentTheme, isSpace]);

  return (
    <div id="d3-analytics-container" className="w-full relative mt-4">
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[9px] font-mono uppercase tracking-[0.2em] text-[#C9933A] font-bold">
          📈 D3 SCHOLARSHIP TIMELINE PATH
        </span>
        <span className="text-[8px] font-mono text-stone-400 uppercase">
          Cumulative Progress Curve (0-4 Chapters)
        </span>
      </div>
      
      <div ref={containerRef} className="w-full h-[180px] bg-black/5 dark:bg-black/20 rounded border border-stone-200/10 p-3 relative select-none">
        <svg ref={svgRef} className="w-full h-full" />
        
        {/* Dynamic Interactive Tooltip */}
        {hoveredPoint && (
          <div 
            style={{ 
              left: `${tooltipPos.x}px`, 
              top: `${tooltipPos.y}px`,
              pointerEvents: 'none'
            }}
            className="absolute z-10 bg-stone-900 border border-[#C9933A]/50 text-white rounded px-2.5 py-1 text-[9px] font-mono leading-none shadow-xl flex flex-col gap-1 transition-all duration-75 animate-fade-in"
          >
            <span className="text-[#C9933A] font-bold">{hoveredPoint.day}</span>
            <span>Completed: {hoveredPoint.completedCount}/4 ({Math.round((hoveredPoint.completedCount / 4) * 100)}%)</span>
          </div>
        )}
      </div>
    </div>
  );
}
