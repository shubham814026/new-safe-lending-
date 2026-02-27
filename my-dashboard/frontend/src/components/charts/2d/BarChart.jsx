import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const BarChart = memo(function BarChart({ data }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: Math.min(320, width * 0.55) });
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(() => ({ top: 20, right: 20, bottom: 40, left: 50 }), []);

  const { x0Scale, x1Scale, yScale, colorScale } = useMemo(() => {
    if (!data) return {};
    const { width, height } = dimensions;

    const x0 = d3
      .scaleBand()
      .domain(data.categories)
      .range([margin.left, width - margin.right])
      .paddingInner(0.2)
      .paddingOuter(0.1);

    const x1 = d3
      .scaleBand()
      .domain(data.groups)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const allValues = data.data.flatMap((d) => data.groups.map((g) => d[g]));
    const y = d3
      .scaleLinear()
      .domain([0, d3.max(allValues) * 1.1])
      .range([height - margin.bottom, margin.top]);

    const color = d3.scaleOrdinal().domain(data.groups).range(['#06b6d4', '#8b5cf6', '#10b981']);

    return { x0Scale: x0, x1Scale: x1, yScale: y, colorScale: color };
  }, [data, dimensions, margin]);

  useEffect(() => {
    if (!data || !x0Scale || !x1Scale || !yScale) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Grid
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat('')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.08)'));

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x0Scale).tickSize(0))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Tooltip
    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.bar-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'bar-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.95)')
      .style('border', '1px solid rgba(148,163,184,0.2)')
      .style('border-radius', '8px')
      .style('padding', '6px 10px')
      .style('font-size', '11px')
      .style('color', '#f1f5f9')
      .style('opacity', 0)
      .style('z-index', 10);

    // Bars
    const groups = svg
      .selectAll('.bar-group')
      .data(data.data)
      .join('g')
      .attr('class', 'bar-group')
      .attr('transform', (d) => `translate(${x0Scale(d.category)},0)`);

    groups
      .selectAll('rect')
      .data((d) => data.groups.map((g) => ({ group: g, value: d[g], category: d.category })))
      .join('rect')
      .attr('x', (d) => x1Scale(d.group))
      .attr('width', x1Scale.bandwidth())
      .attr('y', height - margin.bottom)
      .attr('height', 0)
      .attr('rx', 3)
      .attr('fill', (d) => colorScale(d.group))
      .attr('opacity', 0.85)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1);
        tooltip
          .html(`<strong>${d.category}</strong><br/>${d.group}: ${d.value}`)
          .style('left', `${event.offsetX + 10}px`)
          .style('top', `${event.offsetY - 30}px`)
          .style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.85);
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(800)
      .delay((_, i) => i * 80)
      .ease(d3.easeCubicOut)
      .attr('y', (d) => yScale(d.value))
      .attr('height', (d) => height - margin.bottom - yScale(d.value));

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${width - margin.right - 160}, ${margin.top})`);

    data.groups.forEach((g, i) => {
      const row = legend.append('g').attr('transform', `translate(${i * 60}, 0)`);
      row.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', colorScale(g));
      row.append('text').attr('x', 14).attr('y', 9).text(g).attr('fill', '#94a3b8').style('font-size', '9px');
    });
  }, [data, x0Scale, x1Scale, yScale, colorScale, dimensions, margin]);

  if (!data) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
});

export default BarChart;
