import React, { useRef, useEffect, useMemo, useCallback, memo, useState } from 'react';
import * as d3 from 'd3';

const LineChart = memo(function LineChart({ data }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 300 });
  const [hiddenSeries, setHiddenSeries] = useState(new Set());

  // ─── Responsive resize ──────────────────────────────────────────
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: Math.min(320, width * 0.5) });
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(() => ({ top: 20, right: 20, bottom: 40, left: 50 }), []);

  const xScale = useMemo(() => {
    if (!data) return null;
    return d3
      .scalePoint()
      .domain(data.labels)
      .range([margin.left, dimensions.width - margin.right]);
  }, [data, dimensions.width, margin]);

  const yScale = useMemo(() => {
    if (!data) return null;
    const allVals = data.series
      .filter((s) => !hiddenSeries.has(s.name))
      .flatMap((s) => s.data);
    if (allVals.length === 0) return null;
    return d3
      .scaleLinear()
      .domain([d3.min(allVals) * 0.95, d3.max(allVals) * 1.05])
      .range([dimensions.height - margin.bottom, margin.top]);
  }, [data, dimensions.height, margin, hiddenSeries]);

  const lineGenerator = useMemo(() => {
    if (!xScale || !yScale) return null;
    return d3
      .line()
      .x((_, i) => xScale(data.labels[i]))
      .y((d) => yScale(d))
      .curve(d3.curveMonotoneX);
  }, [xScale, yScale, data]);

  // ─── Draw chart ──────────────────────────────────────────────────
  useEffect(() => {
    if (!data || !xScale || !yScale || !lineGenerator) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;

    // Grid lines
    svg
      .append('g')
      .attr('class', 'grid')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yScale)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat('')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.08)'));

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickValues(data.labels.filter((_, i) => i % 5 === 0))
      )
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) =>
        g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px')
      )
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) =>
        g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px')
      )
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Lines with animation
    data.series
      .filter((s) => !hiddenSeries.has(s.name))
      .forEach((series) => {
        const path = svg
          .append('path')
          .datum(series.data)
          .attr('d', lineGenerator)
          .attr('fill', 'none')
          .attr('stroke', series.color)
          .attr('stroke-width', 2.5)
          .attr('stroke-linecap', 'round');

        const totalLength = path.node().getTotalLength();
        path
          .attr('stroke-dasharray', totalLength)
          .attr('stroke-dashoffset', totalLength)
          .transition()
          .duration(1500)
          .ease(d3.easeCubicInOut)
          .attr('stroke-dashoffset', 0);
      });

    // Tooltip overlay
    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.line-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'line-tooltip')
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.95)')
      .style('border', '1px solid rgba(148,163,184,0.2)')
      .style('border-radius', '8px')
      .style('padding', '8px 12px')
      .style('font-size', '11px')
      .style('color', '#f1f5f9')
      .style('opacity', 0)
      .style('z-index', 10)
      .style('backdrop-filter', 'blur(8px)');

    const crosshairV = svg
      .append('line')
      .attr('stroke', 'rgba(148,163,184,0.3)')
      .attr('stroke-dasharray', '4,4')
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .style('opacity', 0);

    svg
      .append('rect')
      .attr('width', width - margin.left - margin.right)
      .attr('height', height - margin.top - margin.bottom)
      .attr('transform', `translate(${margin.left},${margin.top})`)
      .attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const [mx] = d3.pointer(event, this);
        const xPos = mx + margin.left;
        // Find closest label
        const distances = data.labels.map((l) => Math.abs(xScale(l) - xPos));
        const idx = distances.indexOf(Math.min(...distances));

        crosshairV.attr('x1', xScale(data.labels[idx])).attr('x2', xScale(data.labels[idx])).style('opacity', 1);

        let html = `<div style="margin-bottom:4px;font-weight:600">${data.labels[idx]}</div>`;
        data.series
          .filter((s) => !hiddenSeries.has(s.name))
          .forEach((s) => {
            html += `<div style="display:flex;align-items:center;gap:6px">
              <span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block"></span>
              ${s.name}: <strong>${s.data[idx]}</strong>
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
        crosshairV.style('opacity', 0);
      });
  }, [data, xScale, yScale, lineGenerator, dimensions, margin, hiddenSeries]);

  const toggleSeries = useCallback((name) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  if (!data) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      {/* Legend */}
      <div className="flex gap-4 mb-2 flex-wrap">
        {data.series.map((s) => (
          <button
            key={s.name}
            onClick={() => toggleSeries(s.name)}
            className="flex items-center gap-1.5 text-xs transition-opacity"
            style={{ opacity: hiddenSeries.has(s.name) ? 0.3 : 1 }}
          >
            <span
              className="w-3 h-0.5 rounded"
              style={{ background: s.color }}
            />
            <span className="text-slate-400">{s.name}</span>
          </button>
        ))}
      </div>
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        className="overflow-visible"
      />
    </div>
  );
});

export default LineChart;
