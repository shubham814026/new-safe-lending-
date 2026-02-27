import React, { useRef, useEffect, memo } from 'react';
import * as d3 from 'd3';

const ConfusionMatrixChart = memo(function ConfusionMatrixChart({ data }) {
  const svgRef = useRef();
  const containerRef = useRef();

  useEffect(() => {
    if (!data?.matrix) return;
    const { width: W } = containerRef.current.getBoundingClientRect();
    const S = Math.min(W - 40, 340); // square size
    const margin = { top: 35, right: 20, bottom: 50, left: 70 };

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', S + margin.top + margin.bottom);
    svg.selectAll('*').remove();

    const g = svg.append('g').attr('transform', `translate(${(W - S) / 2},${margin.top})`);
    const labels = data.labels || ['Non-Default', 'Default'];
    const matrix = data.matrix; // [[TN, FP],[FN, TP]]
    const maxVal = d3.max(matrix.flat());

    const cellSize = S / 2;
    const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([0, maxVal]);

    // Cells
    matrix.forEach((row, i) => {
      row.forEach((val, j) => {
        const cell = g.append('g').attr('transform', `translate(${j * cellSize},${i * cellSize})`);
        cell.append('rect')
          .attr('width', cellSize - 4).attr('height', cellSize - 4)
          .attr('x', 2).attr('y', 2)
          .attr('rx', 8)
          .attr('fill', colorScale(val))
          .attr('opacity', 0)
          .transition().delay((i * 2 + j) * 150).duration(500)
          .attr('opacity', 0.9);

        cell.append('text')
          .attr('x', cellSize / 2).attr('y', cellSize / 2 - 6)
          .attr('text-anchor', 'middle').attr('fill', '#fff')
          .attr('font-size', '22px').attr('font-weight', '700')
          .attr('opacity', 0)
          .text(val.toLocaleString())
          .transition().delay((i * 2 + j) * 150 + 200).duration(300).attr('opacity', 1);

        // Percentage
        const total = matrix.flat().reduce((a, b) => a + b, 0);
        cell.append('text')
          .attr('x', cellSize / 2).attr('y', cellSize / 2 + 16)
          .attr('text-anchor', 'middle').attr('fill', 'rgba(255,255,255,0.7)')
          .attr('font-size', '12px')
          .attr('opacity', 0)
          .text(`${((val / total) * 100).toFixed(1)}%`)
          .transition().delay((i * 2 + j) * 150 + 300).duration(300).attr('opacity', 1);
      });
    });

    // Predicted labels (bottom)
    labels.forEach((label, j) => {
      g.append('text')
        .attr('x', j * cellSize + cellSize / 2)
        .attr('y', S + 20)
        .attr('text-anchor', 'middle')
        .attr('fill', '#94a3b8').attr('font-size', '12px')
        .text(label);
    });
    g.append('text')
      .attr('x', S / 2).attr('y', S + 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', '12px').attr('font-weight', '600')
      .text('Predicted');

    // Actual labels (left)
    labels.forEach((label, i) => {
      g.append('text')
        .attr('x', -10)
        .attr('y', i * cellSize + cellSize / 2 + 4)
        .attr('text-anchor', 'end')
        .attr('fill', '#94a3b8').attr('font-size', '12px')
        .text(label);
    });
    g.append('text')
      .attr('transform', `rotate(-90)`)
      .attr('x', -S / 2).attr('y', -50)
      .attr('text-anchor', 'middle')
      .attr('fill', '#cbd5e1').attr('font-size', '12px').attr('font-weight', '600')
      .text('Actual');

  }, [data]);

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} />
    </div>
  );
});

export default ConfusionMatrixChart;
