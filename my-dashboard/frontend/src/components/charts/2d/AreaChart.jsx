import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const AreaChart = memo(function AreaChart({ data }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

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

  useEffect(() => {
    if (!data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    const xScale = d3
      .scalePoint()
      .domain(data.labels)
      .range([margin.left, width - margin.right]);

    // Stack the series data
    const stackData = data.labels.map((label, i) => {
      const obj = { label };
      data.series.forEach((s) => {
        obj[s.name] = Math.abs(s.data[i]);
      });
      return obj;
    });

    const keys = data.series.map((s) => s.name);
    const stack = d3.stack().keys(keys).offset(d3.stackOffsetNone);
    const layers = stack(stackData);

    const yMax = d3.max(layers, (layer) => d3.max(layer, (d) => d[1]));
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax * 1.1])
      .range([height - margin.bottom, margin.top]);

    const colors = data.series.map((s) => s.color);
    const colorScale = d3.scaleOrdinal().domain(keys).range(colors);

    // Gradients
    const defs = svg.append('defs');
    keys.forEach((key, i) => {
      const grad = defs
        .append('linearGradient')
        .attr('id', `area-grad-${i}`)
        .attr('x1', '0%')
        .attr('y1', '0%')
        .attr('x2', '0%')
        .attr('y2', '100%');
      grad.append('stop').attr('offset', '0%').attr('stop-color', colors[i]).attr('stop-opacity', 0.4);
      grad.append('stop').attr('offset', '100%').attr('stop-color', colors[i]).attr('stop-opacity', 0.02);
    });

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
      .call(d3.axisBottom(xScale).tickValues(data.labels.filter((_, i) => i % 5 === 0)))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    const area = d3
      .area()
      .x((d) => xScale(d.data.label))
      .y0((d) => yScale(d[0]))
      .y1((d) => yScale(d[1]))
      .curve(d3.curveMonotoneX);

    // Areas
    layers.forEach((layer, i) => {
      svg
        .append('path')
        .datum(layer)
        .attr('d', area)
        .attr('fill', `url(#area-grad-${i})`)
        .attr('opacity', 0)
        .transition()
        .duration(800)
        .delay(i * 200)
        .attr('opacity', 1);

      // Area outline
      const line = d3
        .line()
        .x((d) => xScale(d.data.label))
        .y((d) => yScale(d[1]))
        .curve(d3.curveMonotoneX);

      const path = svg
        .append('path')
        .datum(layer)
        .attr('d', line)
        .attr('fill', 'none')
        .attr('stroke', colors[i])
        .attr('stroke-width', 2);

      const totalLength = path.node().getTotalLength();
      path
        .attr('stroke-dasharray', totalLength)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1200)
        .delay(i * 200)
        .ease(d3.easeCubicInOut)
        .attr('stroke-dashoffset', 0);
    });

    // Hover line
    const hoverLine = svg
      .append('line')
      .attr('stroke', 'rgba(148,163,184,0.4)')
      .attr('stroke-dasharray', '4,4')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .style('opacity', 0);

    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.area-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'area-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.95)')
      .style('border', '1px solid rgba(148,163,184,0.2)')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '11px')
      .style('color', '#f1f5f9')
      .style('opacity', 0)
      .style('z-index', 10);

    svg
      .append('rect')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event, this);
        const xPos = mx + margin.left;
        const dists = data.labels.map((l) => Math.abs(xScale(l) - xPos));
        const idx = dists.indexOf(Math.min(...dists));

        hoverLine
          .attr('x1', xScale(data.labels[idx]))
          .attr('x2', xScale(data.labels[idx]))
          .style('opacity', 1);

        let html = `<div style="margin-bottom:4px;font-weight:600">${data.labels[idx]}</div>`;
        data.series.forEach((s) => {
          html += `<div style="display:flex;align-items:center;gap:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block"></span>
            ${s.name}: <strong>${Math.abs(s.data[idx]).toFixed(1)}</strong>
          </div>`;
        });

        tooltip
          .html(html)
          .style('left', `${xScale(data.labels[idx]) + 15}px`)
          .style('top', `${margin.top + 10}px`)
          .style('opacity', 1);
      })
      .on('mouseleave', () => {
        tooltip.style('opacity', 0);
        hoverLine.style('opacity', 0);
      });
  }, [data, dimensions, margin]);

  if (!data) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
});

export default AreaChart;
