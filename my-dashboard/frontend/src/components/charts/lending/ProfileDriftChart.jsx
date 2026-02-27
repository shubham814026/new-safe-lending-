import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const GRADE_COLORS = {
  A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316', E: '#ef4444',
};

const ProfileDriftChart = memo(function ProfileDriftChart({ data, metric = 'dti' }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const series = useMemo(() => {
    if (!data) return [];
    return metric === 'dti' ? data.dti || [] : data.delinquency || [];
  }, [data, metric]);

  useEffect(() => {
    if (!series.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 320;
    const margin = { top: 15, right: 70, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const allYears = series.flatMap(s => s.years);
    const allVals = series.flatMap(s => s.values);
    const x = d3.scaleLinear().domain(d3.extent(allYears)).range([0, w]);
    const y = d3.scaleLinear().domain([0, d3.max(allVals) * 1.15]).range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(v => metric === 'dti' ? v.toFixed(0) : `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');

    series.forEach((s) => {
      const color = GRADE_COLORS[s.grade] || '#94a3b8';
      const lineGen = d3.line()
        .x((_, i) => x(s.years[i]))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);

      const path = g.append('path')
        .datum(s.values)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);

      const totalLength = path.node().getTotalLength();
      path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(1200).ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

      // End label
      const last = s.values.length - 1;
      g.append('text')
        .attr('x', x(s.years[last]) + 7)
        .attr('y', y(s.values[last]) + 4)
        .attr('fill', color)
        .attr('font-size', '10px')
        .attr('font-weight', '600')
        .text(`${s.grade}`);
    });

  }, [series, metric]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default ProfileDriftChart;
