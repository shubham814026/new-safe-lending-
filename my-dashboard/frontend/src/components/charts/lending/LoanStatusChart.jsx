import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const LoanStatusChart = memo(function LoanStatusChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const rows = useMemo(() => data?.rows || [], [data]);

  useEffect(() => {
    if (!rows.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 340;
    const margin = { top: 20, right: 20, bottom: 80, left: 55 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const top = rows.slice(0, 10);

    const x = d3.scaleBand().domain(top.map(d => d.status)).range([0, w]).padding(0.2);
    const y = d3.scaleLinear().domain([0, d3.max(top, d => d.count) * 1.1]).range([h, 0]);

    const palette = d3.scaleOrdinal()
      .domain(top.map(d => d.status))
      .range(['#06b6d4', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#8b5cf6', '#f97316']);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '9px')
      .attr('transform', 'rotate(-45)').attr('text-anchor', 'end');
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(d => d >= 1000 ? `${(d / 1000).toFixed(0)}k` : d))
      .selectAll('text').attr('fill', '#94a3b8');

    // Bars
    g.selectAll('.bar')
      .data(top)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => x(d.status))
      .attr('width', x.bandwidth())
      .attr('y', h)
      .attr('height', 0)
      .attr('fill', d => palette(d.status))
      .attr('opacity', 0.85)
      .attr('rx', 3)
      .transition()
      .delay((_, i) => i * 50)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.count))
      .attr('height', d => h - y(d.count));

    // Percentage labels on top
    g.selectAll('.pct-label')
      .data(top)
      .join('text')
      .attr('class', 'pct-label')
      .attr('x', d => x(d.status) + x.bandwidth() / 2)
      .attr('y', d => y(d.count) - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', '9px').attr('font-weight', '600')
      .attr('opacity', 0)
      .text(d => `${d.pct.toFixed(1)}%`)
      .transition()
      .delay((_, i) => i * 50 + 400)
      .duration(300)
      .attr('opacity', 1);

  }, [rows]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default LoanStatusChart;
