import { useEffect, useRef, useState } from 'react'
import Tooltip from './components/tooltip'
import './App.css'
function App() {
  const canvasDom = useRef(null)
  const canvasDom2 = useRef(null)
  const [hoveredSector, setHoveredSector] = useState(-1); // -1 表示无 hover
  const [toolTipPos, setToolTipPos] = useState({top:0,left:0})
  let data = [
    { title: "AAA", value: 5},{ title: "BBB", value: 2},
    { title: "CCC", value: 5},{ title: "DDD", value: 6},
    { title: "EEE", value: 5},{ title: "FFF", value: 9},
  ]
  useEffect(()=>{
    let ctx = canvasDom.current.getContext("2d")
    let ctx2 = canvasDom2.current.getContext("2d")
    let ringWidth = 20;
    let tic=10;
    let baseRadius  = tic*ringWidth;
    let radianRatio = Math.PI/180

    const sectorCount = data.length;
    const sectorAngle = (2 * Math.PI) / sectorCount; // 每个扇形弧度
    ctx.save();
    ctx.translate(canvasDom.current.width/2,canvasDom.current.height/2)
    for(let i=0;i<tic;i++){
      const outerRadius = baseRadius - i * ringWidth;
      ctx.beginPath();
      ctx.fillStyle=i%2==0?"#2D3642":"#424B58";
      ctx.arc(0,0,outerRadius,0,Math.PI*2,false)
      ctx.closePath()
      ctx.fill()
    }
    
    let rectWidth = 8
    let radianHalf=rectWidth/2
    ctx.fillStyle="#424B58"
    let radian = 360/sectorCount;
    for(let i=0;i<sectorCount;i++){
      ctx.beginPath()
      ctx.font="20px arial"
      ctx.textAlign="center";
      ctx.fillText(data[i].title,0,-baseRadius-10)
      ctx.rotate(radian*Math.PI/180)
      ctx.moveTo(0-radianHalf,0-radianHalf);
      ctx.lineTo(0-radianHalf, -baseRadius)
      ctx.lineTo(rectWidth-radianHalf, -baseRadius)
      ctx.lineTo(rectWidth-radianHalf, 0)
      ctx.closePath();
      ctx.fill()
    }
    ctx.restore();

    function getArcBoundingBox(cx, cy, r, startAngle, endAngle) {
      // 标准化角度到 [0, 2π)
      const normalize = (a) => ((a % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  
      const a1 = normalize(startAngle);
      const a2 = normalize(endAngle);
      const crossesZero = a2 < a1; // 是否跨越 0 弧度（即从 >π 到 <π）
  
      // 判断某个角度是否在圆弧区间内
      const isInArc = (angle) => {
          let a = normalize(angle);
          if (crossesZero) {
              return a >= a1 || a <= a2;
          } else {
              return a >= a1 && a <= a2;
          }
      };
  
      // 起点和终点坐标
      const x1 = cx + r * Math.cos(startAngle);
      const y1 = cy + r * Math.sin(startAngle);
      const x2 = cx + r * Math.cos(endAngle);
      const y2 = cy + r * Math.sin(endAngle);
  
      let minX = Math.min(x1, x2);
      let maxX = Math.max(x1, x2);
      let minY = Math.min(y1, y2);
      let maxY = Math.max(y1, y2);
  
      // 检查四个极值点
      if (isInArc(0)) {
          maxX = Math.max(maxX, cx + r); // 最右
      }
      if (isInArc(Math.PI)) {
          minX = Math.min(minX, cx - r); // 最左
      }
      if (isInArc(Math.PI / 2)) {
          minY = Math.min(minY, cy - r); // 最上（y 最小，因为 y 向上为正）
      }
      if (isInArc(3 * Math.PI / 2)) {
          maxY = Math.max(maxY, cy + r); // 最下（y 最大）
      }
  
      return { minX, maxX, minY, maxY };
  }

    // 画扇形
    const drawFanshaped=(i)=>{
      ctx2.clearRect(0,0,canvasDom.current.width,canvasDom.current.height)
      ctx2.save()
      ctx2.translate(canvasDom.current.width/2,canvasDom.current.height/2)
      ctx2.fillStyle="rgba(255, 255, 255,0.2)"
      ctx2.beginPath()
      ctx2.moveTo(0, 0); // 移动到圆心
      
      ctx2.arc(0,0,baseRadius,(-radian/2+i*radian)*radianRatio -Math.PI/2,(radian/2+i*radian)*radianRatio-Math.PI/2)
      ctx2.closePath();
      ctx2.fill()
      ctx2.restore()
    }

    // 绘制每个 data[i].value 对应的位置点
    // === 平滑多边形绘制（使用 Catmull-Rom 转 Bezier）===
    const points = [];
    for (let i = 0; i < data.length; i++) {
      const angle = i * sectorAngle - Math.PI / 2;
      const radius = data[i].value * ringWidth;
      points.push({
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle)
      });
    }

    // 闭合：复制前两个点到末尾，后两个点到开头（用于 Catmull-Rom）
    const closedPoints = [
      points[points.length - 1], // 前一个（虚拟）
      ...points,
      points[0],
      points[1]
    ];

    ctx.save();
    ctx.translate(canvasDom.current.width / 2, canvasDom.current.height / 2);
    ctx.beginPath();
    ctx.fillStyle = "red";

    // 从第一个真实点开始
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i <= data.length; i++) {
      const p0 = closedPoints[i - 1];
      const p1 = closedPoints[i];
      const p2 = closedPoints[i + 1];
      const p3 = closedPoints[i + 2];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, p2.x, p2.y);
    }

    ctx.closePath();
    ctx.fill();
    ctx.restore();

    const showTooltip = (i, dx, dy, x, y, rect) => {
      const sectorCenterAngle = i * sectorAngle - Math.PI / 2; // 与绘图逻辑一致
      const tooltipRadius = baseRadius + 15; // 稍微外扩一点
    
      const tipX = tooltipRadius * Math.cos(sectorCenterAngle);
      const tipY = tooltipRadius * Math.sin(sectorCenterAngle);
    
      const centerX = canvasDom.current.width / 2;
      const centerY = canvasDom.current.height / 2;
    
      setToolTipPos({
        left: rect.left + centerX + tipX,
        top:  rect.top  + centerY + tipY
      });
    };
    
     // 鼠标移动处理
     const handleMouseMove = (e) => {
      const rect = canvasDom.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = canvasDom.current.width / 2;
      const centerY = canvasDom.current.height / 2;
      const dx = x - centerX;
      const dy = y - centerY;
      const radius = Math.sqrt(dx * dx + dy * dy);

      // 如果在圆外，不触发
      if (radius > baseRadius) {
        ctx2.clearRect(0,0,canvasDom.current.width,canvasDom.current.height)
        setHoveredSector(-1);
        return;
      }

      // 计算角度（以 12 点钟为 0）
      let angle = Math.atan2(dy, dx); // [-π, π]
      // let normalized = angle + Math.PI / 2; // 调整：12点=0
      let normalized = angle + Math.PI / 2 + (radian/2)*radianRatio; // 调整：12点=0
      if (normalized < 0) normalized += 2 * Math.PI; // 转成 [0, 2π)

      const sectorIndex = Math.floor(normalized / sectorAngle) % sectorCount;
      drawFanshaped(sectorIndex)
      showTooltip(sectorIndex, dx, dy, x,y,rect);
      
      setHoveredSector(sectorIndex);
    };
    canvasDom2.current.addEventListener('mousemove', handleMouseMove);

    return ()=>{
      canvasDom2.current.removeEventListener("mousemove", handleMouseMove)
      ctx.clearRect(0,0,canvasDom.current.width,canvasDom.current.height);
    }
  }, [])
  return (
    <>
    <Tooltip data={data} hoveredSector={hoveredSector} toolTipPos={toolTipPos} />
    <canvas className='canvasDom2' ref={canvasDom2} width={500} height={500}></canvas>
    <canvas ref={canvasDom} width={500} height={500}></canvas>
    </>
  )
}

export default App
