import React from 'react';

const CurrentRate = (props) => {
    return (
        <div>   
            <div className = 'params-choice'>
                <label for = 'current-rate'>Choose your current rate</label>
                <div>
                    <select id = 'current-rate' className = 'select'>
                        <option value = {props.currentRate.rateA.name}>{props.currentRate.rateA.name}</option>
                        <option value = {props.currentRate.rateB.name}>{props.currentRate.rateB.name}</option>
                    </select>
                </div>
                <p className = 'tooltip'><a>Need more details?</a></p>
            </div>
            <div className = 'params-desc'>
                <div className = 'desc'>
                    <p>{props.currentRate.rateA.name} - {props.currentRate.rateA.desc}</p>
                    <p>{props.currentRate.rateB.name} - {props.currentRate.rateB.desc}</p>
                </div>
            </div>
        </div>
    )
}

export default CurrentRate;