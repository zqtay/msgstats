//@ts-nocheck
import * as d3 from "d3";
import { useEffect, useRef } from "react";

const DonutChart = (props: { data: { [key: string]: number; }; }) => {
  const chartRef = useRef(null);

  useEffect(() => {
    chartRef.current.innerHTML = "";
    _DonutChart(
      props.data,
      chartRef.current,
      {
        width: 200,
        height: 200,
        margin: 0,
        color: d3.scaleOrdinal().domain(Object.keys(props.data)).range(d3.schemeDark2),
        label: false
      }
    );
  }, [props.data]);

  return (
    <div>
      <svg ref={chartRef}></svg>
    </div>
  );
};

// Based on:
// https://d3-graph-gallery.com/graph/donut_label.html
const _DonutChart = (
  data: { [key: string]: number; },
  ref: any,
  param: {
    width: number,
    height: number,
    margin: number;
    color: any;
    label: boolean;
    valueRound: number;
  }) => {
  // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
  let radius = Math.min(param.width, param.height) / 2 - param.margin;

  // append the svg object to the ref node
  let svg = d3.select(ref)
    .attr("width", param.width)
    .attr("height", param.height)
    .append("g")
    .attr("transform", "translate(" + param.width / 2 + "," + param.height / 2 + ")");

  // Compute the position of each group on the pie:
  let pie = d3.pie()
    .sort(null) // Do not sort group by size
    .value(d => d[1])
  let data_ready = pie(Object.entries(data));

  // The arc generator
  let arc = d3.arc()
    .innerRadius(radius * 0.6)         // This is the size of the donut hole
    .outerRadius(radius)
    .padAngle(0.02);

  // Another arc that won't be drawn. Just for labels positioning
  let outerArc = d3.arc()
    .innerRadius(radius)
    .outerRadius(radius);

  // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
  svg
    .selectAll('allSlices')
    .data(data_ready)
    .enter()
    .append('path')
    .attr('d', arc)
    .attr('fill', d => param.color(d.data[0]))
    .style("opacity", 0.7);

  // Add labels:
  if (param.label) {
    const label = svg
      .selectAll('allLabels')
      .data(data_ready)
      .enter()
      .append('text')
      .attr('transform', d => {
        let pos = outerArc.centroid(d);
        let midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        pos[0] = radius * 0.8 * (midangle < Math.PI ? 1 : -1);
        return 'translate(' + pos + ')';
      })
      .style('text-anchor', "middle")
      .style('font-size', radius * 0.4 / 6);
    label
      .append('tspan')
      .text(d => {
        let key = d.data[0];
        if (key.length > 6) {
          // Split by space and get the first word
          key = key.split(" ")[0];
          // Slice if the first word is still too long
          return (key.length > 6) ? key.slice(0, 6) : key;
        }
        else {
          return d.data[0];
        }
      })
    label
      .append('tspan')
      .text(d => d.data[1].toFixed(param.valueRound))
      .attr('x', "0")
      .attr('y', "1.5em");
  }
};

export default DonutChart;