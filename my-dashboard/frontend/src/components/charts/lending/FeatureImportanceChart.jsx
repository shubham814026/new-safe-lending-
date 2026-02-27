import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const FeatureImportanceChart = memo(function FeatureImportanceChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const features = useMemo(() => {
    if (!data?.features) return [];
    return data.features.slice(0, 15); // top 15
  }, [data]);

  useEffect(() => {
    if (!features.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = Math.max(380, features.length * 28 + 60);
    const margin = { top: 15, right: 80, bottom: 30, left: 140 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const y = d3.scaleBand()
      .domain(features.map(f => f.name))
      .range([0, h])
      .padding(0.2);
    const x = d3.scaleLinear()
      .domain([0, d3.max(features, f => f.importance) * 1.15])
      .range([0, w]);

    // Grid
    g.append('g').call(d3.axisBottom(x).tickSize(h).tickFormat(''))
      .attr('transform', `translate(0,0)`)
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g')
      .call(d3.axisLeft(y).tickSize(0))
      .selectAll('text').attr('fill', '#cbd5e1').attr('font-size', '11px');

    // Color scale
    const colorScale = d3.scaleLinear()
      .domain([0, d3.max(features, f => f.importance)])
      .range(['#06b6d4', '#a855f7']);

    // Bars
    g.selectAll('.bar')
      .data(features)
      .join('rect')
      .attr('class', 'bar')
      .attr('y', d => y(d.name))
      .attr('height', y.bandwidth())
      .attr('x', 0)
      .attr('width', 0)
      .attr('fill', d => colorScale(d.importance))
      .attr('opacity', 0.88)
      .attr('rx', 3)
      .transition()
      .delay((_, i) => i * 40)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('width', d => x(d.importance));

    // Value labels
    g.selectAll('.val-label')
      .data(features)
      .join('text')
      .attr('class', 'val-label')
      .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
      .attr('x', d => x(d.importance) + 6)
      .attr('fill', '#94a3b8')
      .attr('font-size', '10px')
      .attr('opacity', 0)
      .text(d => d.importance.toFixed(4))
      .transition()
      .delay((_, i) => i * 40 + 400)
      .duration(300)
      .attr('opacity', 1);

  }, [features]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default FeatureImportanceChart;
