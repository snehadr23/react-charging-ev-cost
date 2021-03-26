import React from 'react';

const ChargingHourOption = (props) => {
    return (
    <option value = {props.hours}>{props.hours}</option>
    )
}

export default ChargingHourOption;