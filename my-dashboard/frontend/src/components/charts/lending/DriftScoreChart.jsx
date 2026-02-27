import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const DriftScoreChart = memo(function DriftScoreChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const rows = useMemo(() => data?.rows || [], [data]);

  useEffect(() => {
    if (!rows.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 340;
    const margin = { top: 20, right: 15, bottom: 40, left: 55 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleLinear()
      .domain(d3.extent(rows, d => d.year))
      .range([0, w]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(rows, d => d.spread) * 1.15])
      .range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g').call(d3.axisLeft(y).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');

    // Gradient
    const defs = svg.append('defs');
    const grad = defs.append('linearGradient').attr('id', 'drift-area-grad')
      .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
    grad.append('stop').attr('offset', '0%').attr('stop-color', '#a855f7').attr('stop-opacity', 0.5);
    grad.append('stop').attr('offset', '100%').attr('stop-color', '#a855f7').attr('stop-opacity', 0.03);

    // Area
    const area = d3.area()
      .x(d => x(d.year))
      .y0(h)
      .y1(d => y(d.spread))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(rows)
      .attr('d', area)
      .attr('fill', 'url(#drift-area-grad)');

    // Line
    const line = d3.line().x(d => x(d.year)).y(d => y(d.spread)).curve(d3.curveMonotoneX);
    const path = g.append('path')
      .datum(rows)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#a855f7')
      .attr('stroke-width', 2.5);
    const totalLen = path.node().getTotalLength();
    path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
      .transition().duration(1200).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // Dots
    g.selectAll('circle')
      .data(rows)
      .join('circle')
      .attr('cx', d => x(d.year))
      .attr('cy', d => y(d.spread))
      .attr('r', 0)
      .attr('fill', '#c084fc')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .transition()
      .delay((_, i) => 1200 + i * 80)
      .duration(300)
      .attr('r', 5);

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.tooltip-ds').data([0])
      .join('div').attr('class', 'tooltip-ds')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px').style('padding', '8px 12px')
      .style('font-size', '12px').style('color', '#e2e8f0').style('opacity', 0);

    g.selectAll('circle')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 7);
        tooltip.html(`<strong>${d.year}</strong><br/>Spread: ${d.spread.toFixed(2)}%<br/>Grade A: ${d.rate_A?.toFixed(1) ?? '-'}%<br/>Grade G: ${d.rate_G?.toFixed(1) ?? '-'}%`)
          .style('left', `${event.offsetX + 12}px`).style('top', `${event.offsetY - 10}px`).style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('r', 5);
        tooltip.style('opacity', 0);
      });
  }, [rows]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default DriftScoreChart;
