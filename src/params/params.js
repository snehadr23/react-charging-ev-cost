import React, {Component} from 'react';
import CurrentRate from './currentRate';
// import Miles from './miles';
class Params extends Component {
    state = {
        currentRate: {
            rateA : {
                desc: 'Flat rate - $0.15/kWh',
                name: 'Rate A'
            },
            rateB : {
                desc: 'TOU Rate - $0.20/kWh(Noon - 6pm), $0.08/kWh(Otherwise)',
                name: 'Rate B'
            }
        },
        miles : {
            milesStart: 1000,
            milesStep: 1000,
            milesEnd: 100000
        },
        timeOfDay : {
            option1 : 'Midnight to 6am',
            option2 : '6am to Noon',
            option3 : 'Noon to 6pm',
            option4 : '6pm to Midnight'
        }
    }
    render () {
        return (
            <div>
                <CurrentRate currentRate = {this.state.currentRate}/>
                {/* <Miles/> */}
                {/*<TimeOfDay/> */}
            </div>
        )
    }
};

export default Params;