import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const VerificationChart = memo(function VerificationChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const rows = useMemo(() => data?.rows || [], [data]);

  useEffect(() => {
    if (!rows.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 360;
    const margin = { top: 25, right: 20, bottom: 50, left: 55 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const grades = rows.map(d => d.grade);
    const statuses = ['Not Verified', 'Source Verified', 'Verified'];
    const colorMap = { 'Not Verified': '#06b6d4', 'Source Verified': '#a855f7', 'Verified': '#f59e0b' };

    const x0 = d3.scaleBand().domain(grades).range([0, w]).padding(0.2);
    const x1 = d3.scaleBand().domain(statuses).range([0, x0.bandwidth()]).padding(0.06);
    const maxRate = d3.max(rows, d => Math.max(d.not_verified || 0, d.source_verified || 0, d.verified || 0));
    const y = d3.scaleLinear().domain([0, maxRate * 1.15]).range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x0).tickSizeOuter(0))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '11px');
    g.append('g').call(d3.axisLeft(y).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');

    const keyMap = { 'Not Verified': 'not_verified', 'Source Verified': 'source_verified', 'Verified': 'verified' };

    rows.forEach((row, ri) => {
      statuses.forEach((st, si) => {
        const val = row[keyMap[st]] || 0;
        g.append('rect')
          .attr('x', x0(row.grade) + x1(st))
          .attr('width', x1.bandwidth())
          .attr('y', h)
          .attr('height', 0)
          .attr('fill', colorMap[st])
          .attr('opacity', 0.85)
          .attr('rx', 2)
          .transition()
          .delay(ri * 60 + si * 25)
          .duration(500)
          .ease(d3.easeCubicOut)
          .attr('y', y(val))
          .attr('height', h - y(val));
      });
    });

    // Legend
    const leg = svg.append('g').attr('transform', `translate(${margin.left + 10},8)`);
    statuses.forEach((st, i) => {
      const lg = leg.append('g').attr('transform', `translate(${i * 130},0)`);
      lg.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', colorMap[st]);
      lg.append('text').attr('x', 14).attr('y', 9).attr('fill', '#cbd5e1').attr('font-size', '10px').text(st);
    });

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.tooltip-ver').data([0])
      .join('div').attr('class', 'tooltip-ver')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px').style('padding', '8px 12px')
      .style('font-size', '12px').style('color', '#e2e8f0').style('opacity', 0);

    g.selectAll('rect')
      .on('mouseover', function (event) {
        d3.select(this).attr('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.85);
      });

  }, [rows]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default VerificationChart;
