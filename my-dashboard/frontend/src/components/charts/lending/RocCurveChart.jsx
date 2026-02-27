import React, { useRef, useEffect, memo } from 'react';
import * as d3 from 'd3';

const RocCurveChart = memo(function RocCurveChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data?.fpr || !data?.tpr) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 380;
    const margin = { top: 20, right: 20, bottom: 45, left: 50 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain([0, 1]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 1]).range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(y).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g')
      .call(d3.axisLeft(y).ticks(5))
      .selectAll('text').attr('fill', '#94a3b8');

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + w / 2).attr('y', H - 5)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', '11px')
      .text('False Positive Rate');
    svg.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -(margin.top + h / 2)).attr('y', 14)
      .attr('text-anchor', 'middle').attr('fill', '#94a3b8').attr('font-size', '11px')
      .text('True Positive Rate');

    // Random baseline
    g.append('line')
      .attr('x1', 0).attr('y1', h).attr('x2', w).attr('y2', 0)
      .attr('stroke', '#475569').attr('stroke-width', 1.5).attr('stroke-dasharray', '6 4');

    // Prepare data points
    const points = data.fpr.map((fpr, i) => ({ fpr, tpr: data.tpr[i] }));
    // Downsample for performance
    const step = Math.max(1, Math.floor(points.length / 200));
    const sampled = points.filter((_, i) => i % step === 0 || i === points.length - 1);

    // AUC filled area
    const defs = svg.append('defs');
    const areaGrad = defs.append('linearGradient').attr('id', 'roc-area-grad')
      .attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1');
    areaGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.25);
    areaGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.02);

    g.append('path')
      .datum(sampled)
      .attr('d', d3.area().x(d => x(d.fpr)).y0(h).y1(d => y(d.tpr)).curve(d3.curveMonotoneX))
      .attr('fill', 'url(#roc-area-grad)');

    // ROC line
    const line = d3.line().x(d => x(d.fpr)).y(d => y(d.tpr)).curve(d3.curveMonotoneX);
    const path = g.append('path')
      .datum(sampled)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2.5);
    const totalLen = path.node().getTotalLength();
    path.attr('stroke-dasharray', totalLen).attr('stroke-dashoffset', totalLen)
      .transition().duration(1500).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // AUC badge
    const auc = data.auc || 0;
    const badge = g.append('g').attr('transform', `translate(${w * 0.6},${h * 0.4})`);
    badge.append('rect')
      .attr('x', -50).attr('y', -20).attr('width', 100).attr('height', 40).attr('rx', 8)
      .attr('fill', 'rgba(15,23,42,0.85)').attr('stroke', '#06b6d4').attr('stroke-width', 1.5);
    badge.append('text')
      .attr('text-anchor', 'middle').attr('y', 5)
      .attr('fill', '#06b6d4').attr('font-size', '16px').attr('font-weight', '700')
      .text(`AUC = ${auc.toFixed(4)}`);

  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default RocCurveChart;
