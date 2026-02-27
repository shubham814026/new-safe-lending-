import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const GRADE_COLORS = {
  A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316',
  E: '#ef4444', F: '#dc2626', G: '#7f1d1d',
};

const RateAlignmentChart = memo(function RateAlignmentChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const scatter = useMemo(() => data?.scatter || [], [data]);

  useEffect(() => {
    if (!scatter.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 360;
    const margin = { top: 20, right: 30, bottom: 45, left: 55 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain([d3.min(scatter, d => d.median_rate) - 1, d3.max(scatter, d => d.median_rate) + 1])
      .range([0, w]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(scatter, d => d.default_rate) * 1.15])
      .range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');

    // Axis labels
    g.append('text').attr('x', w / 2).attr('y', h + 38)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', '11px')
      .text('Median Interest Rate (%)');
    g.append('text').attr('transform', 'rotate(-90)')
      .attr('x', -h / 2).attr('y', -42)
      .attr('text-anchor', 'middle').attr('fill', '#64748b').attr('font-size', '11px')
      .text('Actual Default Rate (%)');

    // Trendline
    const xVals = scatter.map(d => d.median_rate);
    const yVals = scatter.map(d => d.default_rate);
    const n = xVals.length;
    const xMean = d3.mean(xVals);
    const yMean = d3.mean(yVals);
    const slope = d3.sum(xVals.map((xi, i) => (xi - xMean) * (yVals[i] - yMean))) /
                  d3.sum(xVals.map(xi => (xi - xMean) ** 2));
    const intercept = yMean - slope * xMean;
    const xRange = d3.extent(xVals);
    g.append('line')
      .attr('x1', x(xRange[0])).attr('y1', y(slope * xRange[0] + intercept))
      .attr('x2', x(xRange[1])).attr('y2', y(slope * xRange[1] + intercept))
      .attr('stroke', '#94a3b8').attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6 4').attr('opacity', 0.6);

    // Scatter points
    g.selectAll('circle')
      .data(scatter)
      .join('circle')
      .attr('cx', d => x(d.median_rate))
      .attr('cy', d => y(d.default_rate))
      .attr('r', 0)
      .attr('fill', d => GRADE_COLORS[d.grade] || '#94a3b8')
      .attr('opacity', 0.8)
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 1.5)
      .transition()
      .delay((_, i) => i * 15)
      .duration(400)
      .attr('r', 6);

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.tooltip-ra').data([0])
      .join('div').attr('class', 'tooltip-ra')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px').style('padding', '8px 12px')
      .style('font-size', '12px').style('color', '#e2e8f0').style('opacity', 0);

    g.selectAll('circle')
      .on('mouseover', function (event, d) {
        d3.select(this).transition().duration(150).attr('r', 9);
        tooltip.html(`<strong>Grade ${d.grade} (${d.year})</strong><br/>Rate: ${d.median_rate}%<br/>Default: ${d.default_rate}%`)
          .style('left', `${event.offsetX + 15}px`).style('top', `${event.offsetY - 10}px`).style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).transition().duration(150).attr('r', 6);
        tooltip.style('opacity', 0);
      });

  }, [scatter]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default RateAlignmentChart;
