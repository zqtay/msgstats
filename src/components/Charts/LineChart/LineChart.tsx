import * as d3 from "d3";
import { useRef, useState, useEffect, RefObject } from "react";
import Tooltip from "../Tooltip/Tooltip";
import styles from "./LineChart.module.scss";

type SeriesData = { [key: string]: [number, number][]; };
const DEFAULT_X_MAX = 100;
const DEFAULT_Y_MAX = 100;

const LineChart = (props: { data: SeriesData, xLabel?: string, yLabel?: string, xTicks?: number, yTicks?: number; }) => {
  const chartRef: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
  const [tooltipState, setTooltipState] = useState({ show: false, rectPos: undefined, text: "" });

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.innerHTML = "";
      _LineChart(
        props.data,
        chartRef.current,
        setTooltipState,
        {
          width: 1120,
          height: 400,
          margin: 50,
          xLabel: props.xLabel,
          yLabel: props.yLabel,
          xTicks: props.xTicks,
          yTicks: props.yTicks,
          color: d3.scaleOrdinal().domain(Object.keys(props.data)).range(d3.schemeDark2),
          valueRound: 2
        }
      );
    }
  }, [props.data]);

  return (
    <div className={styles["linechart-container"]}>
      <div ref={chartRef} className={styles["linechart"]}/>
      <Tooltip show={tooltipState.show} rectPos={tooltipState?.rectPos} text={tooltipState.text}/>
    </div>
  );
};

// Based on:
// https://www.educative.io/answers/how-to-create-a-line-chart-using-d3
const _LineChart = (
  data: SeriesData,
  ref: HTMLDivElement,
  setTooltipState: any,
  param: {
    width: number,
    height: number,
    margin: number,
    xLabel?: string,
    yLabel?: string,
    xTicks?: number,
    yTicks?: number,
    color?: any,
    valueRound?: number;
  }) => {

  const fixed = d3.select(ref)
    .append('svg')
    .attr("width", param.margin + 10)
    .attr("height", param.height)
    .style("min-width", param.margin + 10);

  const svg = d3.select(ref)
    .append('div')
    .style("overflow-x", "auto")
    .append('svg')
    .attr("width", param.width)
    .attr("height", param.height)
    .attr("viewBox", [0, 0, param.width, param.height]);

  const xyLists = Object.values(data);
  let xMax = d3.max(xyLists, xyList => d3.max(xyList, xy => xy[0]));
  let yMax = d3.max(xyLists, xyList => d3.max(xyList, xy => xy[1]));
  if (xMax === undefined) xMax = DEFAULT_X_MAX;
  if (yMax === undefined) yMax = DEFAULT_Y_MAX;
  const xScale = d3.scaleLinear().domain([0, xMax]).range([param.margin, (param.width - param.margin)]);
  const yScale = d3.scaleLinear().domain([0, yMax]).range([(param.height - param.margin), param.margin]);

  if (param.xLabel) {
    // X label
    svg.append('text')
      .attr('x', param.width * 0.5)
      .attr('y', param.height - param.margin + 35)
      .attr('text-anchor', 'middle')
      .style('font-size', 15)
      .text(param.xLabel);
  }
  if (param.yLabel) {
    // Y label
    fixed.append('text')
      .attr('text-anchor', 'middle')
      .attr('transform', `translate(${param.margin - 35},${param.height * 0.5})rotate(-90)`)
      .style('font-size', 15)
      .text(param.yLabel);
  }

  // Axes
  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);
  if (param.xTicks) xAxis.ticks(param.xTicks);
  if (param.yTicks) yAxis.ticks(param.yTicks);
  svg.append("g")
    .attr("transform", "translate(0," + (param.height - param.margin) + ")")
    .style('font-size', 12)
    .call(xAxis);
  fixed.append("g")
    .attr("transform", `translate(${param.margin}, 0)`)
    .style('font-size', 12)
    .call(yAxis);

  let line;
  const getTooltipLabel = (seriesName: string, d: any) =>
    `<b>${seriesName}</b><br>${d[0]}<br>${param.valueRound ? d[1].toFixed(param.valueRound) : d[1]}<br>`;
  Object.entries(data).forEach((entry, i) => {
    svg.append('g')
      .selectAll("dot")
      .data(entry[1])
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d[0]))
      .attr("cy", d => yScale(d[1]))
      .attr("r", 6)
      .style("fill", param.color(entry[0]))
      .style("opacity", 0.7)
      .style("cursor", "pointer")
      .on("mouseover", function (e, d) {
        setTooltipState({ show: true, rectPos: this.getBoundingClientRect(), text: getTooltipLabel(entry[0], d) });
      })
      .on("mouseout", function () {
        setTooltipState((prev: any) => ({ ...prev, show: false }));
      });

    line = d3.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]))
      .curve(d3.curveLinear);

    svg.append("path")
      .datum(entry[1])
      .attr("class", "line")
      .attr("d", line)
      .style("fill", "none")
      .style("stroke", param.color(entry[0]))
      .style("stroke-width", "3")
      .style("opacity", 0.7);
  });
};

export default LineChart;