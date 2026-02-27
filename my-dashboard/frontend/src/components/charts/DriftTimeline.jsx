import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const DriftTimeline = memo(function DriftTimeline({ history, prediction }) {
  const svgRef = useRef(null);
  const wrapperRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 700, height: 340 });

  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width } = entries[0].contentRect;
        setDimensions({ width, height: Math.min(360, width * 0.45) });
      }
    });
    if (wrapperRef.current) observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const margin = useMemo(() => ({ top: 20, right: 30, bottom: 40, left: 50 }), []);

  useEffect(() => {
    if (!history || !prediction) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const { width, height } = dimensions;
    const allDays = [...history, ...prediction.map((p) => ({ ...p, accuracy: p.predicted_accuracy }))];

    const xScale = d3
      .scaleLinear()
      .domain([1, d3.max(allDays, (d) => d.day)])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([50, 100])
      .range([height - margin.bottom, margin.top]);

    // Grid
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(
        d3.axisLeft(yScale).tickSize(-(width - margin.left - margin.right)).tickFormat('')
      )
      .call((g) => g.select('.domain').remove())
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.06)'));

    // Red warning zone (below 82%)
    svg
      .append('rect')
      .attr('x', margin.left)
      .attr('y', yScale(82))
      .attr('width', width - margin.left - margin.right)
      .attr('height', yScale(50) - yScale(82))
      .attr('fill', 'rgba(239,68,68,0.06)')
      .attr('rx', 4);

    svg
      .append('text')
      .attr('x', width - margin.right - 5)
      .attr('y', yScale(82) + 14)
      .attr('text-anchor', 'end')
      .attr('fill', 'rgba(239,68,68,0.4)')
      .style('font-size', '9px')
      .text('WARNING ZONE');

    // Confidence interval shading
    const ciArea = d3
      .area()
      .x((d) => xScale(d.day))
      .y0((d) => yScale(d.lower_bound))
      .y1((d) => yScale(d.upper_bound))
      .curve(d3.curveMonotoneX);

    svg
      .append('path')
      .datum(prediction)
      .attr('d', ciArea)
      .attr('fill', 'rgba(139,92,246,0.15)')
      .attr('opacity', 0)
      .transition()
      .duration(800)
      .delay(2000)
      .attr('opacity', 1);

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height - margin.bottom})`)
      .call(
        d3.axisBottom(xScale).ticks(10).tickFormat((d) => `Day ${d}`)
      )
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '9px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(6).tickFormat((d) => `${d}%`))
      .call((g) => g.select('.domain').attr('stroke', 'rgba(148,163,184,0.15)'))
      .call((g) => g.selectAll('text').attr('fill', '#94a3b8').style('font-size', '10px'))
      .call((g) => g.selectAll('.tick line').attr('stroke', 'rgba(148,163,184,0.15)'));

    // Historical line (cyan)
    const histLine = d3
      .line()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.accuracy))
      .curve(d3.curveMonotoneX);

    const histPath = svg
      .append('path')
      .datum(history)
      .attr('d', histLine)
      .attr('fill', 'none')
      .attr('stroke', '#06b6d4')
      .attr('stroke-width', 2.5);

    const histLength = histPath.node().getTotalLength();
    histPath
      .attr('stroke-dasharray', histLength)
      .attr('stroke-dashoffset', histLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0);

    // Prediction line (purple dashed)
    const predLine = d3
      .line()
      .x((d) => xScale(d.day))
      .y((d) => yScale(d.predicted_accuracy))
      .curve(d3.curveMonotoneX);

    const predPath = svg
      .append('path')
      .datum(prediction)
      .attr('d', predLine)
      .attr('fill', 'none')
      .attr('stroke', '#8b5cf6')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', '8,4');

    const predLength = predPath.node().getTotalLength();
    predPath
      .attr('stroke-dasharray', predLength)
      .attr('stroke-dashoffset', predLength)
      .transition()
      .duration(1000)
      .delay(2000)
      .ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', 0)
      .on('end', function () {
        d3.select(this).attr('stroke-dasharray', '8,4');
      });

    // "NOW" vertical marker
    const nowDay = history[history.length - 1].day;
    svg
      .append('line')
      .attr('x1', xScale(nowDay))
      .attr('x2', xScale(nowDay))
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 1.5)
      .attr('stroke-dasharray', '6,4')
      .attr('opacity', 0)
      .transition()
      .delay(1500)
      .duration(400)
      .attr('opacity', 0.6);

    svg
      .append('text')
      .attr('x', xScale(nowDay))
      .attr('y', margin.top - 6)
      .attr('text-anchor', 'middle')
      .attr('fill', '#f1f5f9')
      .style('font-size', '10px')
      .style('font-weight', '600')
      .attr('opacity', 0)
      .text('TODAY')
      .transition()
      .delay(1500)
      .duration(400)
      .attr('opacity', 0.8);

    // Tooltip
    const tooltip = d3
      .select(wrapperRef.current)
      .selectAll('.drift-tooltip')
      .data([null])
      .join('div')
      .attr('class', 'drift-tooltip')
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
        const dayHover = Math.round(xScale.invert(mx + margin.left));
        const histPt = history.find((h) => h.day === dayHover);
        const predPt = prediction.find((p) => p.day === dayHover);
        const pt = histPt || predPt;
        if (!pt) return;

        let html = `<div style="font-weight:600;margin-bottom:4px">${pt.date} (Day ${pt.day})</div>`;
        if (histPt) {
          html += `<div style="color:#06b6d4">Accuracy: <strong>${histPt.accuracy}%</strong></div>`;
          html += `<div style="color:#f59e0b">Drift: <strong>${histPt.drift_score}</strong></div>`;
        }
        if (predPt) {
          html += `<div style="color:#8b5cf6">Predicted: <strong>${predPt.predicted_accuracy}%</strong></div>`;
          html += `<div style="color:#94a3b8">CI: [${predPt.lower_bound}% — ${predPt.upper_bound}%]</div>`;
        }

        tooltip
          .html(html)
          .style('left', `${xScale(pt.day) + 15}px`)
          .style('top', `${margin.top}px`)
          .style('opacity', 1);
      })
      .on('mouseleave', () => tooltip.style('opacity', 0));

    // Legend
    const legend = svg
      .append('g')
      .attr('transform', `translate(${margin.left + 10}, ${margin.top + 10})`);

    [
      { label: 'Historical Accuracy', color: '#06b6d4', dash: '' },
      { label: 'Predicted Accuracy', color: '#8b5cf6', dash: '8,4' },
      { label: 'Confidence Interval', color: 'rgba(139,92,246,0.3)', dash: '' },
    ].forEach((item, i) => {
      const g = legend.append('g').attr('transform', `translate(0, ${i * 16})`);
      if (item.label === 'Confidence Interval') {
        g.append('rect').attr('width', 16).attr('height', 8).attr('rx', 2).attr('fill', item.color);
      } else {
        g.append('line')
          .attr('x1', 0)
          .attr('x2', 16)
          .attr('y1', 4)
          .attr('y2', 4)
          .attr('stroke', item.color)
          .attr('stroke-width', 2)
          .attr('stroke-dasharray', item.dash);
      }
      g.append('text')
        .attr('x', 22)
        .attr('y', 8)
        .attr('fill', '#94a3b8')
        .style('font-size', '9px')
        .text(item.label);
    });
  }, [history, prediction, dimensions, margin]);

  if (!history || !prediction) return null;

  return (
    <div ref={wrapperRef} className="relative w-full">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height} className="overflow-visible" />
    </div>
  );
});

export default DriftTimeline;
