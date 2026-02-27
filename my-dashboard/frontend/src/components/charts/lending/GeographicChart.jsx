import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const GeographicChart = memo(function GeographicChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const states = useMemo(() => data?.states || [], [data]);
  const overall = data?.overall_rate || 0;

  useEffect(() => {
    if (!states.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 380;
    const margin = { top: 20, right: 15, bottom: 60, left: 50 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleBand()
      .domain(states.map(s => s.state))
      .range([0, w])
      .padding(0.15);
    const y = d3.scaleLinear()
      .domain([0, d3.max(states, s => s.default_rate) * 1.1])
      .range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x))
      .selectAll('text').attr('fill', '#94a3b8').attr('font-size', '7px')
      .attr('transform', 'rotate(-65)').attr('text-anchor', 'end');
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');

    const catColor = { danger: '#ef4444', warning: '#f59e0b', safe: '#10b981', neutral: '#94a3b8' };

    // Bars
    g.selectAll('rect')
      .data(states)
      .join('rect')
      .attr('x', d => x(d.state))
      .attr('width', x.bandwidth())
      .attr('y', h)
      .attr('height', 0)
      .attr('fill', d => catColor[d.category])
      .attr('opacity', 0.88)
      .attr('rx', 2)
      .transition()
      .delay((_, i) => i * 12)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('y', d => y(d.default_rate))
      .attr('height', d => h - y(d.default_rate));

    // Average line
    g.append('line')
      .attr('x1', 0).attr('x2', w)
      .attr('y1', y(overall)).attr('y2', y(overall))
      .attr('stroke', '#06b6d4').attr('stroke-width', 2)
      .attr('stroke-dasharray', '8 4');
    g.append('text')
      .attr('x', w - 5).attr('y', y(overall) - 6)
      .attr('text-anchor', 'end')
      .attr('fill', '#06b6d4').attr('font-size', '10px').attr('font-weight', '600')
      .text(`Avg: ${overall.toFixed(1)}%`);

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.tooltip-geo').data([0])
      .join('div').attr('class', 'tooltip-geo')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px').style('padding', '8px 12px')
      .style('font-size', '12px').style('color', '#e2e8f0').style('opacity', 0);

    g.selectAll('rect')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip.html(`<strong>${d.state}</strong><br/>Default: ${d.default_rate}%<br/>Loans: ${d.n_loans.toLocaleString()}`)
          .style('left', `${event.offsetX + 12}px`).style('top', `${event.offsetY - 10}px`).style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.88);
        tooltip.style('opacity', 0);
      });

  }, [states, overall]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default GeographicChart;
