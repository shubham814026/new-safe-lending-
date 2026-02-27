import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const LoanVolumeChart = memo(function LoanVolumeChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const rows = useMemo(() => data?.rows || [], [data]);

  useEffect(() => {
    if (!rows.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 340;
    const margin = { top: 20, right: 60, bottom: 40, left: 60 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(rows, d => d.year)).range([0, w]);
    const yCount = d3.scaleLinear()
      .domain([0, d3.max(rows, d => d.count) * 1.1])
      .range([h, 0]);
    const yAmount = d3.scaleLinear()
      .domain([0, d3.max(rows, d => d.total_amount) * 1.1])
      .range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(yCount).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g').call(d3.axisLeft(yCount).tickFormat(d => `${(d / 1000).toFixed(0)}k`))
      .selectAll('text').attr('fill', '#06b6d4');
    g.append('g').attr('transform', `translate(${w},0)`)
      .call(d3.axisRight(yAmount).tickFormat(d => `$${(d / 1e6).toFixed(0)}M`))
      .selectAll('text').attr('fill', '#f59e0b');

    // Area - count
    const defs = svg.append('defs');
    const areaGrad = defs.append('linearGradient').attr('id', 'vol-area-grad')
      .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.3);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.02);

    g.append('path')
      .datum(rows)
      .attr('d', d3.area().x(d => x(d.year)).y0(h).y1(d => yCount(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', 'url(#vol-area-grad)');

    // Line - count
    const countLine = g.append('path')
      .datum(rows)
      .attr('d', d3.line().x(d => x(d.year)).y(d => yCount(d.count)).curve(d3.curveMonotoneX))
      .attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 2.5);
    const cl = countLine.node().getTotalLength();
    countLine.attr('stroke-dasharray', cl).attr('stroke-dashoffset', cl)
      .transition().duration(1000).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // Line - amount
    const amountLine = g.append('path')
      .datum(rows)
      .attr('d', d3.line().x(d => x(d.year)).y(d => yAmount(d.total_amount)).curve(d3.curveMonotoneX))
      .attr('fill', 'none').attr('stroke', '#f59e0b').attr('stroke-width', 2.5).attr('stroke-dasharray', '6 3');
    const al = amountLine.node().getTotalLength();
    amountLine.attr('stroke-dasharray', `${al}`).attr('stroke-dashoffset', al)
      .transition().duration(1000).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0)
      .on('end', function () { d3.select(this).attr('stroke-dasharray', '6 3'); });

    // Legend
    const leg = svg.append('g').attr('transform', `translate(${margin.left + 10},8)`);
    [{ label: 'Loan Count', color: '#06b6d4', dash: '' }, { label: 'Total Amount', color: '#f59e0b', dash: '6 3' }].forEach((item, i) => {
      const lg = leg.append('g').attr('transform', `translate(${i * 140},0)`);
      lg.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 5).attr('y2', 5)
        .attr('stroke', item.color).attr('stroke-width', 2).attr('stroke-dasharray', item.dash);
      lg.append('text').attr('x', 25).attr('y', 9).attr('fill', '#cbd5e1').attr('font-size', '10px').text(item.label);
    });

  }, [rows]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default LoanVolumeChart;
