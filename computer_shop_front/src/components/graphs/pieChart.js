import React, {useEffect,useRef,useState} from 'react';
import * as d3 from "d3";

const PieChart = ({
  data=[],
  height=null,
  width=null,
  margin=20,
}) => {
  const [radius, setRadius] = useState(740);
  const [sizeData, setData] = useState({});
  const ref = useRef();

  useEffect(()=>{
    const resize = () => {
      setRadius(Math.min(ref.current.clientWidth, ref.current.clientHeight));
      setData({width: ref.current.clientWidth, height: ref.current.clientHeight});
    }
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, [])

  const createPie = d3
  .pie()
  .value(d => d.value)
  .sort(null);

  const createArc = d3
    .arc()
    .innerRadius(((width||height||radius)/2 - 2*margin)/3)
    .outerRadius((width||height||radius)/2 - 2*margin);

  const colors = d3.scaleOrdinal().domain(data.map(d => d.name))
  .range(["#8d9cb5", "#cc3f3f", "#379adb", "#58bd46"])
  const myData = createPie(data);


  return <svg ref={ref} fontSize={10} preserveAspectRatio="none" width={width||"100%"} height={height||"100%"}>
    <g>
      {
        data.map((d, i)=>{
          return <g key={i}>
            <rect key={d.name} x={sizeData.width - 100} y={data.indexOf(d)*25} width={15} stroke='black' strokeWidth={1} height={15} fill={colors(d.name)}/>
            <text x={sizeData.width - 80} y={data.indexOf(d)*25+11}>{d.name}</text>
          </g>
        })
      }
    </g>
    <g transform={`translate(${sizeData.width/2} ${sizeData.height/2})`}>
      {
        myData.map((d, i) => (
          <g key={i} className="arc">
          <path className="arc" d={createArc(d)} fill={colors(i)} stroke='black' strokeWidth={1.5}/>
          <text
            transform={`translate(${createArc.centroid(d)})`}
            textAnchor="middle"
            fill="white"
            fontSize="10"
          >
            {d.value===0 ? '' : d.value + ' ' + d.data.name}
          </text>
        </g>
        ))
      }
    </g>
  </svg>
}

export default PieChart;