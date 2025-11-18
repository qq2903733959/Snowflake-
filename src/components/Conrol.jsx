
import { Col, InputNumber, Row, Slider, Space, Radio } from 'antd';
import React, { memo, useState } from 'react';
import "./Conrol.css"

export default memo((props)=>{
    // const [inputValue, setInputValue] = useState(1);
    // const onChange = newValue => {
    //     setInputValue(newValue);
    // };
    return<div className='Conrol'>
        <div className="dimensionality Conrol-box">
            <h2 className="Conrol-title">调整维度分数</h2>
            <div className="dimensionality-content">
                {props.data.map((item,key)=>{
                    return(
                        <div key={key} className='dimensionality-items'>
                            <div>{item.title}</div>
                            <Slider
                                dotActiveBorderColor={"#fff"}
                                min={1}
                                max={10}
                                onChange={value=>props.dChange(key,value)}
                                value={item.value}
                                />
                        </div>
                    )
                })}
            </div>
        </div>
        <div className="highlight Conrol-box">
            <h2 className="Conrol-title">选择高亮区域</h2>
            <div className="highlight-content">
                <Radio.Group value={props.highlight} onChange={props.hChange} options={[{label:"none",value:-1}].concat(props.data.map((item,key)=>({label: item.title, value: key})))}>
                </Radio.Group>
            </div>
        </div>
    </div>
})