import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

import type { TrendPoint } from '@/services/analytics';

const WIDTH = 760;
const HEIGHT = 320;
const MARGIN = { top: 16, right: 24, bottom: 40, left: 72 };

const compactUsd = (n: number) =>
  `$${d3.format('.2s')(n).replace('G', 'B')}`;

/**
 * Area + line of total monthly revenue across all practices, rendered with D3
 * into an SVG the effect owns.
 */
export function RevenueTrendChart({ data }: { data: TrendPoint[] }) {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(ref.current);
    svg.selectAll('*').remove();
    if (data.length === 0) return;

    const innerW = WIDTH - MARGIN.left - MARGIN.right;
    const innerH = HEIGHT - MARGIN.top - MARGIN.bottom;

    const g = svg
      .append('g')
      .attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

    const parse = (p: string) => new Date(p);

    const x = d3
      .scaleTime()
      .domain(d3.extent(data, (d) => parse(d.period)) as [Date, Date])
      .range([0, innerW]);

    const y = d3
      .scaleLinear()
      .domain([0, (d3.max(data, (d) => d.revenue) ?? 1) * 1.1])
      .nice()
      .range([innerH, 0]);

    // Gridlines
    g.append('g')
      .attr('color', '#e5e7eb')
      .call(
        d3
          .axisLeft(y)
          .tickSize(-innerW)
          .tickFormat(() => '')
      )
      .call((s) => s.select('.domain').remove());

    // Axes
    g.append('g')
      .attr('transform', `translate(0,${innerH})`)
      .attr('color', '#9ca3af')
      .call(
        d3
          .axisBottom(x)
          .ticks(6)
          .tickFormat((d) => d3.timeFormat('%b %y')(d as Date))
      );

    g.append('g')
      .attr('color', '#9ca3af')
      .call(d3.axisLeft(y).ticks(5).tickFormat((d) => compactUsd(d as number)));

    // Area
    const area = d3
      .area<TrendPoint>()
      .x((d) => x(parse(d.period)))
      .y0(innerH)
      .y1((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', '#0085ca')
      .attr('fill-opacity', 0.12)
      .attr('d', area);

    // Line
    const line = d3
      .line<TrendPoint>()
      .x((d) => x(parse(d.period)))
      .y((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    g.append('path')
      .datum(data)
      .attr('fill', 'none')
      .attr('stroke', '#0085ca')
      .attr('stroke-width', 2.5)
      .attr('d', line);

    // Points
    g.append('g')
      .selectAll('circle')
      .data(data)
      .join('circle')
      .attr('cx', (d) => x(parse(d.period)))
      .attr('cy', (d) => y(d.revenue))
      .attr('r', 3)
      .attr('fill', '#00244a')
      .append('title')
      .text((d) => `${d.period}\n${compactUsd(d.revenue)} · ${d.fte} FTE`);
  }, [data]);

  if (data.length === 0) return null;

  return (
    <div className="bg-white p-6 shadow-lg">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-brand-deep">
        Total revenue by month
      </h3>
      <svg
        ref={ref}
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="h-auto w-full"
        role="img"
        aria-label="Line chart of total monthly revenue across all practices"
      />
    </div>
  );
}
