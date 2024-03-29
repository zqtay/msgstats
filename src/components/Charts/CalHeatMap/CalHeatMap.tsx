//@ts-nocheck
import styles from "./CalHeatMap.module.scss";
import Tooltip from "../Tooltip/Tooltip";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";

const CalHeatMap = (
  props: {
    data: { [key: string]: { [key: string]: number; }; },
    dateStart?: string,
    dateEnd?: string,
  }) => {
  const calRef = useRef(null);
  const [tooltipState, setTooltipState] = useState({ show: false });

  useEffect(() => {
    //{"user":{"2020-01-01": 3}} => [{"date": new Date("2020-01-01"), "values": [3]}]
    let users = Object.keys(props.data);
    let formattedData = Object.keys(props.data[users[0]])
      .map(date => ({
        "date": new Date(date),
        "values": users.map(user => props.data[user][date])
      }));
    if (props.dateStart && props.dateEnd) {
      const oDateStart = new Date(props.dateStart);
      const oDateEnd = new Date(props.dateEnd);
      formattedData = formattedData.filter(d => (d.date >= oDateStart && d.date <= oDateEnd));
    }

    const dataLabel = (d) => {
      return `<b>${d3.utcFormat("%B %-d, %Y")(d.date)}: ${d.values.reduce((a, b) => a + b)}</b>
      <br>
      ${users.map((user, iUser) => `${user}: ${d.values[iUser]}`).join("<br>")}`;
    };

    // Clear html tree first
    calRef.current.innerHTML = "";
    Calendar(formattedData,
      calRef.current,
      setTooltipState,
      {
        x: d => d.date,
        y: d => d.values.reduce((a, b) => a + b),
        dataLabel: dataLabel,
        width: 1080,
        cellSize: 20,
        weekday: "sunday",
        colors: d3.interpolateRgb("#F0F0F0", "#F07080")
      }
    );
  }, [props]);

  return (
    <div className={styles["calheatmap-container"]}>
      <div ref={calRef} className={styles["calheatmap"]} />
      <Tooltip show={tooltipState.show} rectPos={tooltipState.rectPos} text={tooltipState.text} />
    </div>
  );
};

// Based on:
// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/calendar-view
function Calendar(data: any[], calRef, setTooltipState, {
  x = ([x]) => x, // given d in data, returns the (temporal) x-value
  y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
  dataLabel, // given d in data, returns the title text
  width = 928, // width of the chart, in pixels
  cellSize = 17, // width and height of an individual day, in pixels
  weekday = "weekday", // either: weekday, sunday, or monday
  formatDay = i => "SMTWTFS"[i], // given a day number in [0, 6], the day-of-week label
  formatMonth = "%b", // format specifier string for months (above the chart)
  yFormat, // format specifier string for values (in the title)
  colors = d3.interpolatePiYG
} = {}) {
  // Compute values.
  const X = d3.map(data, x);
  const Y = d3.map(data, y);
  const I = d3.range(X.length);

  const countDay = weekday === "sunday" ? i => i : i => (i + 6) % 7;
  const timeWeek = weekday === "sunday" ? d3.utcSunday : d3.utcMonday;
  const weekDays = weekday === "weekday" ? 5 : 7;
  const height = cellSize * (weekDays + 2);

  // Compute a color scale. This assumes a diverging color scheme where the pivot
  // is zero, and we want symmetric difference around zero.
  const max = d3.quantile(Y, 1, Math.abs);
  const color = d3.scaleSequential([0, +max], colors).unknown("none");

  // Construct formats.
  formatMonth = d3.utcFormat(formatMonth);

  // Compute titles.
  if (dataLabel === undefined) {
    const formatDate = d3.utcFormat("%B %-d, %Y");
    const formatValue = color.tickFormat(100, yFormat);
    dataLabel = i => `${formatDate(X[i])}\n${formatValue(Y[i])}`;
  } else if (dataLabel !== null) {
    const T = d3.map(data, dataLabel);
    dataLabel = i => T[i];
  }

  const years = d3.groups(I, i => X[i].getUTCFullYear());

  // function pathMonth(t) {
  //   const d = Math.max(0, Math.min(weekDays, countDay(t.getUTCDay())));
  //   const w = timeWeek.count(d3.utcYear(t), t);
  //   return `${d === 0 ? `M${w * cellSize},0`
  //     : d === weekDays ? `M${(w + 1) * cellSize},0`
  //       : `M${(w + 1) * cellSize},0V${d * cellSize}H${w * cellSize}`}V${weekDays * cellSize}`;
  // }

  const fixed = d3.select(calRef)
    .append('svg')
    .attr("width", 45)
    .attr("height", height * years.length)
    .style("min-width", 45);

  const svg = d3.select(calRef)
    .append("div")
    .style("overflow-x", "auto")
    .append("svg")
    .attr("width", width)
    .attr("height", height * years.length)
    .attr("viewBox", [0, 0, width, height * years.length])
    .attr("font-family", "sans-serif")
    .attr("font-size", 16);

  const yearFixed = fixed.selectAll("g")
    .data(years)
    .join("g")
    .attr("transform", (d, i) => `translate(45,${height * i + cellSize * 1.5})`);

  const year = svg.selectAll("g")
    .data(years)
    .join("g")
    .attr("transform", (d, i) => `translate(10,${height * i + cellSize * 1.5})`);

  yearFixed.append("text")
    .attr("x", -5)
    .attr("y", -5)
    .attr("font-weight", "bold")
    .attr("text-anchor", "end")
    .text(([key]) => key);

  yearFixed.append("g")
    .attr("text-anchor", "end")
    .selectAll("text")
    .data(weekday === "weekday" ? d3.range(1, 6) : d3.range(7))
    .join("text")
    .attr("x", -5)
    .attr("y", i => (countDay(i) + 0.5) * cellSize)
    .attr("dy", "0.31em")
    .text(formatDay);

  year.append("g")
    .selectAll("rect")
    .data(weekday === "weekday"
      ? ([, I]) => I.filter(i => ![0, 6].includes(X[i].getUTCDay()))
      : ([, I]) => I)
    .join("rect")
    .attr("width", cellSize - 1)
    .attr("height", cellSize - 1)
    .attr("x", i => timeWeek.count(d3.utcYear(X[i]), X[i]) * cellSize + 0.5)
    .attr("y", i => countDay(X[i].getUTCDay()) * cellSize + 0.5)
    .attr("fill", i => color(Y[i]))
    .style("cursor", "pointer")
    .on("mouseover", function (e, d) {
      d3.select(this)
        .attr('stroke-width', "2px")
        .attr("stroke", "#202020");
      setTooltipState({ show: true, rectPos: this.getBoundingClientRect(), text: dataLabel(d) });
    })
    .on("mouseout", function () {
      d3.select(this)
        .attr('stroke-width', "0.1px")
        .attr("stroke", "#FFFFFF");
      setTooltipState(prev => ({ ...prev, show: false }));
    });

  const month = year.append("g")
    .selectAll("g")
    .data(([, I]) => d3.utcMonths(d3.utcMonth(X[I[0]]), X[I[I.length - 1]]))
    .join("g");

  month.append("text")
    .attr("x", d => timeWeek.count(d3.utcYear(d), timeWeek.ceil(d)) * cellSize + 2)
    .attr("y", -5)
    .text(formatMonth);

  return Object.assign(svg.node(), { scales: { color } });
}

export default CalHeatMap;