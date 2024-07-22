import React, {useEffect,useRef,useState} from 'react';
import * as d3 from "d3";
import { getColorById } from '../../utils';

const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const BarGraph = ({
  content=[],
  height=null,
  width=null,
  marginTop = 20,
  marginRight = 20,
  marginBottom = 20,
  marginLeft = 50,
  range=null,
  timeFrame='year',
  yAxisTickFormat=null,
  onTagClick=null,
  color='lightgray',
  namesButtonText=null
}) => {
  const [inWidth, setWidth] = useState(740);
  const [inHeight, setHeight] = useState(400);
  const gx = useRef();
  const gy = useRef();
  const ref = useRef();

  const data = content.length ? Array.isArray(content[0][1]) ? content : content.map(c=>{
    return [c[0], [[c[1], null, null]]]
  }) : []

  const colors = data.length ? (data[0][1].map(arr=>[arr[1], data[0][1].length===1&&color ? color : getColorById(arr[1])]) ) : []
  height -= 15;
  useEffect(()=>{
    const resize = () => {
      setWidth(ref.current.clientWidth);
      setHeight(ref.current.clientHeight);
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [])

  const yDom = d3.extent(data.length ? data.map(d=>d[1]).map(d=>d[0]).map(d=>d[0]) : []);
  const x = d3.scaleBand().domain(data.map(d=>d[0])).range([marginLeft, (width||inWidth) - marginRight]).padding(0.4);
  const y = d3.scaleLinear().domain(range||[yDom[0], yDom[1]]).range([(height||inHeight) - marginBottom, marginTop-15])

  useEffect(() => {
    d3.select(gy.current).call(d3.axisLeft(y).tickFormat((d, i)=>{
      if(yAxisTickFormat)
        return yAxisTickFormat(d, i);
      return d;
    }));
    d3.select(gy.current).selectAll(".myTick").remove();

    d3.select(gy.current).selectAll(".tick line").clone()
    .attr("x2", (width||inWidth) - marginLeft - marginRight)
    .attr("class", "myTick")
    .attr("stroke-opacity", 0.5)
  }, [gy, inWidth, marginLeft, marginRight, width, y, yAxisTickFormat]);
  useEffect(() => {
    d3.select(gx.current).call(d3.axisBottom(x).tickFormat((d, i)=>{
      const date = new Date(d);
      if(date.getMonth() === 0)
        return date.getFullYear();
      return timeFrame==='year' ? months[date.getMonth()] : (timeFrame==='week' ? days[date.getDay()] : months[date.getMonth()] + " " + date.getDate())
    }))
   }, [gx, timeFrame, x]);

  
   const colorF = d3.scaleOrdinal()
   .domain(data.length ? colors.map(c=>c[0]) : [color])
   .range(colors.map(c=>c[1]));


  return <>
  <div className='supplierNames'>
    {data.length&&(data[0][1].length>1||!color)&&
      data[0][1].map((d, i)=>{
        return <div className='supplierBarName' key={i}>
          <div className='supplierColor' style={{backgroundColor: colors.find(c=>c[0]===d[1])[1]}}/>
          {d[2]}
        </div>
      })
    }
    {namesButtonText&&<div className='supplierBarButton' onClick={onTagClick}>{namesButtonText}</div>}
  </div>
  <svg ref={ref} fontSize={10} preserveAspectRatio="none" width={width||"100%"} height={height||"100%"}>
    <g ref={gy} transform={`translate(${marginLeft},0)`} />
    <g ref={gx} transform={`translate(0,${height - marginBottom})`}/>
    <g fill="white" stroke="currentColor" strokeWidth="1.5">
      {
        data.map((d, i)=>{
          return d[1].map((arr, j)=>{

            var moveX = 0;
            d[1].forEach((arr2, k) => {
              if(arr[0] === arr2[0] && k!==j)
                moveX += (k<j) ? 3 : -3;
            });

            return <rect key={i + " " + j} x={x(d[0])+moveX} y={y(arr[0])} width={x.bandwidth()} height={height-y(arr[0])-marginBottom} fill={colorF(arr[1])}/>
          })
        })
      }

    </g>
  </svg>
  </>
}

export default BarGraph;