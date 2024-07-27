import React, {useEffect,useRef,useState} from 'react';
import * as d3 from "d3";

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const LineGraph = ({
	data=[],
	height=null,
	width=null,
	marginTop = 20,
	marginRight = 20,
	marginBottom = 20,
	marginLeft = 50,
	range=null,
	timeFrame='year',
	yAxisTickFormat=null,
	color='steelblue'
}) => {
	const [inWidth, setWidth] = useState(740);
	const [inHeight, setHeight] = useState(400);
	const gx = useRef();
	const gy = useRef();
	const ref = useRef();

	useEffect(()=>{
		const resize = () => {
			setWidth(ref.current.clientWidth);
			setHeight(ref.current.clientHeight);
		}
		resize();
		window.addEventListener('resize', resize);
		return () => window.removeEventListener('resize', resize);
	}, [])
	const yDom = d3.extent(data.map(d=>d[1]));
	const x = d3.scaleUtc().domain(d3.extent(data.map(d=>new Date(d[0])))).range([marginLeft, (width||inWidth) - marginRight]);
	const y = d3.scaleLinear().domain(range||[yDom[0], yDom[1]]).range([(height||inHeight) - marginBottom, marginTop]);

	const line = d3.line()
			.x(d => x(new Date(d[0])))
			.y(d => y(d[1]));


	useEffect(() => {
		d3.select(gy.current).call(d3.axisLeft(y).tickFormat((d, i)=>{
			if(yAxisTickFormat)
				return yAxisTickFormat(d, i);
			return d;
		}))
		d3.select(gy.current).selectAll(".myTick").remove();

		d3.select(gy.current).selectAll(".tick line").clone()
		.attr("x2", (width||inWidth) - marginLeft - marginRight)
		.attr("class", "myTick")
		.attr("stroke-opacity", 0.2)
 
	}, [inWidth, marginLeft, marginRight, width, y, yAxisTickFormat]);
	useEffect(() => {
		d3.select(gx.current).call(d3.axisBottom(x).tickFormat((d, i)=>{
			const date = new Date(d);
			if(date.getMonth() === 0)
				return date.getFullYear();
			return timeFrame==='year' ? months[date.getMonth()] : (timeFrame==='week' ? days[date.getDay()] : months[date.getMonth()] + " " + date.getDate())
		}))
	 }, [gx, timeFrame, x]);

	return <svg ref={ref} fontSize={10} preserveAspectRatio="none" width={width||"100%"} height={height||"100%"}>
		<g ref={gy} transform={`translate(${marginLeft},0)`}/>
		<g ref={gx} transform={`translate(0,${height - marginBottom})`}/>
		<path d={line(data)} stroke={color} fill='none' strokeWidth={4}/>
</svg>
}

export default LineGraph;