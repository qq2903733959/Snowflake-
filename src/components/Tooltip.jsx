import { useEffect, useRef, useState } from "react";
import "./Tooltip.css"
export default (props)=>{
    let [style, setStyle] = useState({});
    let tooltipDom = useRef(null);
    useEffect(()=>{
        // let toolTipRect = tooltipDom.current.getBoundingClientRect()
        // let top=0;
        // let left =0;
        // props.toolTipPos
        setStyle(props.toolTipPos)
    }, [props.toolTipPos])

    return<>
        {props.hoveredSector>-1&&(
            <div ref={tooltipDom} style={style} className="tooltip">
                <p>{props.data[props.hoveredSector].title}</p>
            </div>
        )}
    </>
}