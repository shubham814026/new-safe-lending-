import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const HeatMap = memo(function HeatMap({ data }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 360 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: Math.min(400, width * 0.4) });
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(() => ({ top: 10, right: 80, bottom: 50, left: 90 }), []);

  useEffect(() => {
    if (!data) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const innerW = width - margin.left - margin.right;
    const innerH = height - margin.top - margin.bottom;

    const cellW = innerW / data.cols.length;
    const cellH = innerH / data.rows.length;

    const allVals = data.matrix.flat();
    const colorScale = d3
      .scaleSequential(d3.interpolateYlOrRd)
      .domain([d3.min(allVals), d3.max(allVals)]);

    // Tooltip
    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.heat-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'heat-tooltip')
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

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Cells
    data.matrix.forEach((row, ri) => {
      row.forEach((val, ci) => {
        g.append('rect')
          .attr('x', ci * cellW)
          .attr('y', ri * cellH)
          .attr('width', cellW - 2)
          .attr('height', cellH - 2)
          .attr('rx', 3)
          .attr('fill', colorScale(val))
          .attr('opacity', 0)
          .on('mouseenter', function (event) {
            d3.select(this).attr('stroke', '#fff').attr('stroke-width', 2);
            tooltip
              .html(
                `<strong>${data.rows[ri]}</strong> × <strong>${data.cols[ci]}</strong><br/>Value: ${val}`
              )
              .style('left', `${event.offsetX + 12}px`)
              .style('top', `${event.offsetY - 10}px`)
              .style('opacity', 1);
          })
          .on('mouseleave', function () {
            d3.select(this).attr('stroke', 'none');
            tooltip.style('opacity', 0);
          })
          .transition()
          .duration(500)
          .delay(ri * 30 + ci * 20)
          .attr('opacity', 1);
      });
    });

    // Row labels
    data.rows.forEach((label, i) => {
      g.append('text')
        .attr('x', -8)
        .attr('y', i * cellH + cellH / 2)
        .attr('text-anchor', 'end')
        .attr('dominant-baseline', 'middle')
        .attr('fill', '#94a3b8')
        .style('font-size', '10px')
        .text(label);
    });

    // Col labels
    data.cols.forEach((label, i) => {
      g.append('text')
        .attr('x', i * cellW + cellW / 2)
        .attr('y', innerH + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8')
        .style('font-size', '10px')
        .text(label);
    });

    // Color legend
    const legendW = 15;
    const legendH = innerH;
    const legendX = innerW + 20;

    const legendScale = d3
      .scaleLinear()
      .domain(colorScale.domain())
      .range([legendH, 0]);

    const defs = svg.append('defs');
    const linearGrad = defs
      .append('linearGradient')
      .attr('id', 'heatmap-legend-grad')
      .attr('x1', '0%')
      .attr('y1', '100%')
      .attr('x2', '0%')
      .attr('y2', '0%');

    const stops = d3.range(0, 1.01, 0.1);
    stops.forEach((t) => {
      linearGrad
        .append('stop')
        .attr('offset', `${t * 100}%`)
        .attr(
          'stop-color',
          colorScale(d3.min(allVals) + t * (d3.max(allVals) - d3.min(allVals)))
        );
    });

    const legendG = svg
      .append('g')
      .attr('transform', `translate(${margin.left + legendX}, ${margin.top})`);

    legendG
      .append('rect')
      .attr('width', legendW)
      .attr('height', legendH)
      .attr('rx', 3)
      .style('fill', 'url(#heatmap-legend-grad)');

    legendG
      .append('g')
      .attr('transform', `translate(${legendW + 4}, 0)`)
      .call(d3.axisRight(legendScale).ticks(5).tickSize(3))
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '9px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', '#94a3b8'));
  }, [data, dimensions, margin]);

  if (!data) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
});

export default HeatMap;
