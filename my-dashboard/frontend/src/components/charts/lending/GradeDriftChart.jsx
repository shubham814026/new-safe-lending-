import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const GRADE_COLORS = {
  A: '#10b981', B: '#3b82f6', C: '#f59e0b', D: '#f97316',
  E: '#ef4444', F: '#dc2626', G: '#7f1d1d',
};

const GradeDriftChart = memo(function GradeDriftChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const series = useMemo(() => data?.series || [], [data]);

  useEffect(() => {
    if (!series.length) return;
    const container = containerRef.current;
    const { width: W } = container.getBoundingClientRect();
    const H = 360;
    const margin = { top: 20, right: 80, bottom: 40, left: 50 };

    const svg = d3.select(svgRef.current)
      .attr('width', W).attr('height', H);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    // Scales
    const allYears = series.flatMap(s => s.years);
    const allRates = series.flatMap(s => s.default_rates);
    const x = d3.scaleLinear()
      .domain([d3.min(allYears), d3.max(allYears)])
      .range([0, w]);
    const y = d3.scaleLinear()
      .domain([0, d3.max(allRates) * 1.1])
      .range([h, 0]);

    // Grid
    g.append('g').attr('class', 'grid')
      .call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.grid .domain').remove();

    // Axes
    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g')
      .call(d3.axisLeft(y).tickFormat(v => `${v}%`))
      .selectAll('text').attr('fill', '#94a3b8');
    g.selectAll('.domain').attr('stroke', '#334155');

    // Lines + dots
    const line = d3.line()
      .x((_, i) => x(series[0].years[i]))
      .curve(d3.curveMonotoneX);

    series.forEach((s) => {
      const color = GRADE_COLORS[s.grade] || '#94a3b8';
      const lineGen = d3.line()
        .x((_, i) => x(s.years[i]))
        .y((d) => y(d))
        .curve(d3.curveMonotoneX);

      // Line
      const path = g.append('path')
        .datum(s.default_rates)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('d', lineGen);

      const totalLength = path.node().getTotalLength();
      path.attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition().duration(1500).ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);

      // Dots
      g.selectAll(`.dot-${s.grade}`)
        .data(s.default_rates)
        .join('circle')
        .attr('cx', (_, i) => x(s.years[i]))
        .attr('cy', d => y(d))
        .attr('r', 0)
        .attr('fill', color)
        .attr('stroke', '#0f172a')
        .attr('stroke-width', 2)
        .transition().delay((_, i) => 1500 + i * 80)
        .duration(300)
        .attr('r', 5);

      // Label at end
      const lastIdx = s.default_rates.length - 1;
      g.append('text')
        .attr('x', x(s.years[lastIdx]) + 8)
        .attr('y', y(s.default_rates[lastIdx]) + 4)
        .attr('fill', color)
        .attr('font-size', '11px')
        .attr('font-weight', '600')
        .text(`${s.grade} ${s.default_rates[lastIdx].toFixed(1)}%`);
    });

    // Tooltip overlay
    const tooltip = d3.select(container).selectAll('.tooltip-gd').data([0])
      .join('div').attr('class', 'tooltip-gd')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '12px')
      .style('color', '#e2e8f0')
      .style('opacity', 0);

    svg.on('mousemove', function (event) {
      const [mx] = d3.pointer(event);
      const adjX = mx - margin.left;
      const year = Math.round(x.invert(adjX));
      const lines = series.filter(s => s.years.includes(year)).map(s => {
        const idx = s.years.indexOf(year);
        return `<span style="color:${GRADE_COLORS[s.grade]}">■</span> Grade ${s.grade}: ${s.default_rates[idx].toFixed(1)}%`;
      });
      if (!lines.length) return;
      tooltip.html(`<strong>${year}</strong><br/>${lines.join('<br/>')}`)
        .style('left', `${event.offsetX + 15}px`)
        .style('top', `${event.offsetY - 10}px`)
        .style('opacity', 1);
    }).on('mouseleave', () => tooltip.style('opacity', 0));

  }, [series]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default GradeDriftChart;
