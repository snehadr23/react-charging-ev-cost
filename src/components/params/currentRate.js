import React from 'react';

const CurrentRate = (props) => {
    return (
        <div>   
            <div className = 'params-choice'>
                <label for = 'current-rate'>Select your current rate</label>
                <div>
                    <select id = 'current-rate' className = 'select' onChange = {props.change} value = {props.val}>
                        <option value = {props.currentRate.rateA.name}>{props.currentRate.rateA.name}</option>
                        <option value = {props.currentRate.rateB.name}>{props.currentRate.rateB.name}</option>
                    </select>
                </div>
                <div>
                    <p className = 'tooltip'>Need more details?</p>
                    <div className = 'params-desc tooltiptext'>
                        <div className = 'desc'>
                            <p>{props.currentRate.rateA.name} - {props.currentRate.rateA.desc}</p>
                            <p>{props.currentRate.rateB.name} - {props.currentRate.rateB.desc}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default CurrentRate;