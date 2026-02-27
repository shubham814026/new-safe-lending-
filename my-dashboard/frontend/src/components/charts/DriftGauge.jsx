import React, { useRef, useEffect, useMemo, useState, memo } from 'react';
import * as d3 from 'd3';

const DriftGauge = memo(function DriftGauge({ current }) {
  const svgRef = useRef(null);
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!current) return;
    const target = current.score;
    const duration = 1500;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setAnimatedValue(eased * target);
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [current]);

  useEffect(() => {
    if (!current) return;
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 280;
    const height = 180;
    const cx = width / 2;
    const cy = height - 20;
    const outerR = 100;
    const innerR = 72;

    const g = svg.append('g').attr('transform', `translate(${cx},${cy})`);

    // Background arc segments
    const arcGen = d3.arc().innerRadius(innerR).outerRadius(outerR).cornerRadius(4);

    // Three zones:  SAFE (0-30%), WARNING (30-60%), CRITICAL (60-100%)
    const zones = [
      { start: -Math.PI / 2, end: -Math.PI / 2 + (Math.PI * 0.3), color: '#10b981' },
      { start: -Math.PI / 2 + (Math.PI * 0.3), end: -Math.PI / 2 + (Math.PI * 0.6), color: '#f59e0b' },
      { start: -Math.PI / 2 + (Math.PI * 0.6), end: Math.PI / 2, color: '#ef4444' },
    ];

    zones.forEach((zone) => {
      g.append('path')
        .attr('d', arcGen({ startAngle: zone.start, endAngle: zone.end }))
        .attr('fill', zone.color)
        .attr('opacity', 0.2);
    });

    // Needle
    const normalizedVal = Math.min(100, Math.max(0, animatedValue));
    const needleAngle = -Math.PI / 2 + (normalizedVal / 100) * Math.PI;

    const needleLen = innerR - 8;
    const nx = Math.cos(needleAngle) * needleLen;
    const ny = Math.sin(needleAngle) * needleLen;

    g.append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', nx)
      .attr('y2', ny)
      .attr('stroke', '#f1f5f9')
      .attr('stroke-width', 2.5)
      .attr('stroke-linecap', 'round');

    g.append('circle').attr('r', 5).attr('fill', '#f1f5f9');

    // Zone labels
    const zoneLabels = [
      { angle: -Math.PI / 2 + Math.PI * 0.15, text: 'SAFE', color: '#10b981' },
      { angle: -Math.PI / 2 + Math.PI * 0.45, text: 'WARN', color: '#f59e0b' },
      { angle: -Math.PI / 2 + Math.PI * 0.8, text: 'CRIT', color: '#ef4444' },
    ];

    zoneLabels.forEach((lbl) => {
      const lr = outerR + 14;
      g.append('text')
        .attr('x', Math.cos(lbl.angle) * lr)
        .attr('y', Math.sin(lbl.angle) * lr)
        .attr('text-anchor', 'middle')
        .attr('dominant-baseline', 'middle')
        .attr('fill', lbl.color)
        .style('font-size', '8px')
        .style('font-weight', '600')
        .text(lbl.text);
    });
  }, [current, animatedValue]);

  if (!current) return null;

  const statusColor =
    current.status === 'safe'
      ? '#10b981'
      : current.status === 'warning'
      ? '#f59e0b'
      : '#ef4444';

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg ref={svgRef} width={280} height={180} />

        {/* Glow */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: statusColor }}
        />
      </div>

      {/* Score */}
      <div className="text-center -mt-10">
        <p className="text-4xl font-bold" style={{ color: statusColor }}>
          {Math.round(animatedValue)}
        </p>
        <p className="text-xs text-slate-500 mt-1">Drift Score</p>
      </div>

      {/* Status Badge */}
      <div
        className="mt-3 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider border"
        style={{
          color: statusColor,
          borderColor: `${statusColor}33`,
          background: `${statusColor}15`,
        }}
      >
        {current.status}
      </div>
    </div>
  );
});

export default DriftGauge;
