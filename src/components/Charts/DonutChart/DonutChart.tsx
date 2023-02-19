//@ts-nocheck
import styles from "./DonutChart.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const DonutChart = (props: { data: { [key: string]: number; }; }) => {
  const chartRef = useRef(null);
  const [tooltipState, setTooltipState] = useState({show: false});
  useEffect(() => {
    chartRef.current.innerHTML = "";
    _DonutChart(
      props.data,
      chartRef.current,
      setTooltipState,
      {
        width: 250,
        height: 250,
        margin: 0,
        color: d3.scaleOrdinal().domain(Object.keys(props.data)).range(d3.schemeDark2),
        label: true,
        valueRound: 0
      }
    );
  }, [props.data]);

  return (
    <div className={styles["chart-donut"]}>
      <svg ref={chartRef}></svg>
      <Tooltip show={tooltipState.show} rectPos={tooltipState.rectPos} text={tooltipState.text} />
    </div>
  );
};

// Based on:
// https://d3-graph-gallery.com/graph/donut_label.html
const _DonutChart = (
  data: { [key: string]: number; },
  ref: any,
  setTooltipState: any,
  param: {
    width: number,
    height: number,
    margin: number,
    color: any,
    label: boolean,
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
    .value(d => d[1]);
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
    const styleTransform = (d, radiusScale) => {
      let pos = outerArc.centroid(d);
      pos[0] = pos[0] * radiusScale;
      pos[1] = pos[1] * radiusScale;
      return 'translate(' + pos + ')';
    };
    const totalValue = d3.sum(data_ready, x => x.value);
    const canShowLabel = d => ((d.data[1] / totalValue) >= 0.04);
    const getPercent = d => {
      const percent = (d.data[1] / totalValue * 100)
        .toFixed(param.valueRound)
        .replace(/[.,]00$/, "");
      return percent + "%";
    };
    const getTooltipLabel = d => `<b>${d.data[0]}</b><br>${d.data[1]}<br>${getPercent(d)}`;
    // Add nodes
    const label = svg
      .selectAll('allLabels')
      .data(data_ready)
      .enter();
    const labelData = label
      .append('text')
      .attr('transform', d => styleTransform(d, 0.5))
      .style('text-anchor', d => {
        const midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return (midangle > Math.PI ? 'start' : 'end');
      })
      .style('font-size', radius * 0.08);
    labelData
      .append('tspan')
      .text(d => {
        if (canShowLabel(d)) {
          let key = d.data[0];
          if (key.length > 6) {
            // Split by space and get the first word
            key = key.split(" ")[0];
            // Slice if the first word is still too long
            key = (key.length > 6) ? key.slice(0, 6) : key;
          }
          return key;
        }
      })
      .attr('x', "0")
      .attr('y', "-0.5em");
    labelData
      .append('tspan')
      .text(d => {
        if (canShowLabel(d)) {
          return d.data[1]
            .toFixed(param.valueRound)
            .replace(/[.,]00$/, "");
        }
      })
      .attr('x', "0")
      .attr('y', "0.5em");
    label
      .append('text')
      // Convert to percentage
      .text(d => canShowLabel(d) ? getPercent(d) : ".")
      .attr('transform', d => styleTransform(d, 0.8))
      .style('text-anchor', "middle")
      .style('fill', '#FFFFFF')
      .style('font-size', radius * 0.1)
      .style('font-weight', 'bold')
      .style("cursor", "pointer")
      .on("mouseover", function (e, d) {
        setTooltipState({show: true, rectPos: this.getBoundingClientRect(), text: getTooltipLabel(d)});
      })
      .on("mouseout", function () {
        setTooltipState(prev => ({...prev, show: false}));
      });
  }
};

export default DonutChart;