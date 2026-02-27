import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const ScatterPlot = memo(function ScatterPlot({ data }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 340 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: Math.min(360, width * 0.55) });
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(() => ({ top: 20, right: 20, bottom: 40, left: 50 }), []);

  const { xScale, yScale, sizeScale } = useMemo(() => {
    if (!data) return {};
    const { width, height } = dimensions;
    const xs = d3
      .scaleLinear()
      .domain(d3.extent(data.points, (d) => d.x))
      .nice()
      .range([margin.left, width - margin.right]);
    const ys = d3
      .scaleLinear()
      .domain(d3.extent(data.points, (d) => d.y))
      .nice()
      .range([height - margin.bottom, margin.top]);
    const ss = d3
      .scaleSqrt()
      .domain(d3.extent(data.points, (d) => d.size))
      .range([3, 12]);
    return { xScale: xs, yScale: ys, sizeScale: ss };
  }, [data, dimensions, margin]);

  useEffect(() => {
    if (!data || !xScale || !yScale || !sizeScale) return;
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
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.06)'));

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(6))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Tooltip
    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.scatter-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'scatter-tooltip')
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

    // Clip path for zoom
    svg
      .append('defs')
      .append('clipPath')
      .attr('id', 'scatter-clip')
      .append('rect')
      .attr('x', margin.left)
      .attr('y', margin.top)
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom);

    const dotsGroup = svg.append('g').attr('clip-path', 'url(#scatter-clip)');

    // Dots
    dotsGroup
      .selectAll('circle')
      .data(data.points)
      .join('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 0)
      .attr('fill', (d) => d.color)
      .attr('opacity', 0.75)
      .attr('stroke', 'rgba(255,255,255,0.1)')
      .attr('stroke-width', 1)
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 1).attr('stroke', '#fff').attr('stroke-width', 2);
        tooltip
          .html(
            `<strong>${d.cluster}</strong><br/>X: ${d.x} | Y: ${d.y}<br/>Size: ${d.size}`
          )
          .style('left', `${event.offsetX + 12}px`)
          .style('top', `${event.offsetY - 10}px`)
          .style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 0.75).attr('stroke', 'rgba(255,255,255,0.1)').attr('stroke-width', 1);
        tooltip.style('opacity', 0);
      })
      .transition()
      .duration(600)
      .delay((_, i) => i * 8)
      .ease(d3.easeCubicOut)
      .attr('r', (d) => sizeScale(d.size));

    // Brush
    const brush = d3
      .brush()
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .on('end', (event) => {
        if (!event.selection) {
          dotsGroup.selectAll('circle').attr('opacity', 0.75);
          return;
        }
        const [[x0, y0], [x1, y1]] = event.selection;
        dotsGroup.selectAll('circle').attr('opacity', (d) => {
          const cx = xScale(d.x);
          const cy = yScale(d.y);
          return cx >= x0 && cx <= x1 && cy >= y0 && cy <= y1 ? 1 : 0.15;
        });
      });

    svg.append('g').attr('class', 'brush').call(brush);

    // Zoom
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 5])
      .on('zoom', (event) => {
        const newX = event.transform.rescaleX(xScale);
        const newY = event.transform.rescaleY(yScale);
        dotsGroup
          .selectAll('circle')
          .attr('cx', (d) => newX(d.x))
          .attr('cy', (d) => newY(d.y));
      });

    svg.call(zoom);
  }, [data, xScale, yScale, sizeScale, dimensions, margin]);

  if (!data) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
});

export default ScatterPlot;
