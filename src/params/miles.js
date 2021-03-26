import React from 'react';

const Miles = (props) => {
    return (
        <div>
            <label for = 'miles'>Choose the Average number of Miles you drive per year</label>
            <select id = 'miles'>
                    <option value = '1000'>1000 Miles</option>
                    <option value = '2000'>2000 Miles</option>
            </select>
        </div>
    )
}

export default Miles;