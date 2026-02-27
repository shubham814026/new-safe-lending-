import React, { useRef, useEffect, useMemo, memo } from 'react';
import * as d3 from 'd3';

const TemporalDecayChart = memo(function TemporalDecayChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  const rows = useMemo(() => data?.years || [], [data]);

  useEffect(() => {
    if (!rows.length) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const H = 380;
    const margin = { top: 25, right: 65, bottom: 45, left: 55 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H);
    svg.selectAll('*').remove();
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
    const w = W - margin.left - margin.right;
    const h = H - margin.top - margin.bottom;

    const x = d3.scaleLinear().domain(d3.extent(rows, d => d.year)).range([0, w]);
    const yAuc = d3.scaleLinear().domain([0.5, 1]).range([h, 0]);
    const yRate = d3.scaleLinear()
      .domain([0, d3.max(rows, d => d.default_rate) * 1.2])
      .range([h, 0]);

    // Grid
    g.append('g').call(d3.axisLeft(yAuc).tickSize(-w).tickFormat(''))
      .selectAll('line').attr('stroke', '#334155').attr('stroke-opacity', 0.3);
    g.selectAll('.domain').attr('stroke', '#334155');

    g.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format('d')))
      .selectAll('text').attr('fill', '#94a3b8');
    g.append('g')
      .call(d3.axisLeft(yAuc).ticks(5))
      .selectAll('text').attr('fill', '#06b6d4');
    g.append('g').attr('transform', `translate(${w},0)`)
      .call(d3.axisRight(yRate).tickFormat(d => `${d}%`))
      .selectAll('text').attr('fill', '#ef4444');

    // Axis labels
    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -(margin.top + h / 2)).attr('y', 14)
      .attr('text-anchor', 'middle').attr('fill', '#06b6d4').attr('font-size', '11px')
      .text('AUC Score');
    svg.append('text')
      .attr('transform', 'rotate(90)')
      .attr('x', margin.top + h / 2).attr('y', -(W - 12))
      .attr('text-anchor', 'middle').attr('fill', '#ef4444').attr('font-size', '11px')
      .text('Default Rate %');

    // AUC line
    const aucLine = d3.line().x(d => x(d.year)).y(d => yAuc(d.auc)).curve(d3.curveMonotoneX);
    const aucPath = g.append('path')
      .datum(rows)
      .attr('d', aucLine)
      .attr('fill', 'none').attr('stroke', '#06b6d4').attr('stroke-width', 2.5);
    const aucLen = aucPath.node().getTotalLength();
    aucPath.attr('stroke-dasharray', aucLen).attr('stroke-dashoffset', aucLen)
      .transition().duration(1200).ease(d3.easeCubicOut).attr('stroke-dashoffset', 0);

    // Default rate bars
    const barW = Math.min(30, w / rows.length * 0.5);
    g.selectAll('.rate-bar')
      .data(rows)
      .join('rect')
      .attr('class', 'rate-bar')
      .attr('x', d => x(d.year) - barW / 2)
      .attr('width', barW)
      .attr('y', h)
      .attr('height', 0)
      .attr('fill', '#ef4444')
      .attr('opacity', 0.35)
      .attr('rx', 3)
      .transition()
      .delay((_, i) => i * 80)
      .duration(600)
      .ease(d3.easeCubicOut)
      .attr('y', d => yRate(d.default_rate))
      .attr('height', d => h - yRate(d.default_rate));

    // AUC dots
    g.selectAll('.auc-dot')
      .data(rows)
      .join('circle')
      .attr('class', 'auc-dot')
      .attr('cx', d => x(d.year))
      .attr('cy', d => yAuc(d.auc))
      .attr('r', 0)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#0f172a')
      .attr('stroke-width', 2)
      .transition()
      .delay((_, i) => 1200 + i * 80)
      .duration(300)
      .attr('r', 6);

    // AUC value labels
    g.selectAll('.auc-label')
      .data(rows)
      .join('text')
      .attr('class', 'auc-label')
      .attr('x', d => x(d.year))
      .attr('y', d => yAuc(d.auc) - 14)
      .attr('text-anchor', 'middle')
      .attr('fill', '#06b6d4').attr('font-size', '10px').attr('font-weight', '600')
      .attr('opacity', 0)
      .text(d => d.auc.toFixed(3))
      .transition()
      .delay((_, i) => 1500 + i * 80)
      .duration(300)
      .attr('opacity', 1);

    // Legend
    const leg = svg.append('g').attr('transform', `translate(${margin.left + 10},8)`);
    [{ label: 'AUC Score', color: '#06b6d4', type: 'line' }, { label: 'Default Rate', color: '#ef4444', type: 'rect' }].forEach((item, i) => {
      const lg = leg.append('g').attr('transform', `translate(${i * 130},0)`);
      if (item.type === 'line') {
        lg.append('line').attr('x1', 0).attr('x2', 20).attr('y1', 5).attr('y2', 5)
          .attr('stroke', item.color).attr('stroke-width', 2.5);
        lg.append('circle').attr('cx', 10).attr('cy', 5).attr('r', 3).attr('fill', item.color);
      } else {
        lg.append('rect').attr('width', 10).attr('height', 10).attr('rx', 2).attr('fill', item.color).attr('opacity', 0.5);
      }
      lg.append('text').attr('x', 25).attr('y', 9).attr('fill', '#cbd5e1').attr('font-size', '10px').text(item.label);
    });

    // Tooltip
    const tooltip = d3.select(containerRef.current).selectAll('.tooltip-td').data([0])
      .join('div').attr('class', 'tooltip-td')
      .style('position', 'absolute').style('pointer-events', 'none')
      .style('background', 'rgba(15,23,42,0.9)')
      .style('border', '1px solid rgba(255,255,255,0.1)')
      .style('border-radius', '8px').style('padding', '8px 12px')
      .style('font-size', '12px').style('color', '#e2e8f0').style('opacity', 0);

    g.selectAll('.auc-dot')
      .on('mouseover', function (event, d) {
        d3.select(this).attr('r', 8);
        tooltip.html(`<strong>${d.year}</strong><br/>AUC: ${d.auc.toFixed(4)}<br/>Default: ${d.default_rate.toFixed(1)}%<br/>Samples: ${d.n_samples.toLocaleString()}`)
          .style('left', `${event.offsetX + 12}px`).style('top', `${event.offsetY - 10}px`).style('opacity', 1);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('r', 6);
        tooltip.style('opacity', 0);
      });

  }, [rows]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default TemporalDecayChart;
