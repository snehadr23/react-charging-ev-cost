import React, {Component} from 'react';
import CurrentRate from './currentRate';
import MileOption from './mileOption';
// import TimeOfDay from '';
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
            milesEnd: 100000,
            milesList: []
        },
        timeOfDay : {
            option1 : 'Midnight to 6am',
            option2 : '6am to Noon',
            option3 : 'Noon to 6pm',
            option4 : '6pm to Midnight'
        }
    }

    componentWillMount() {
        for(var i = 0; i < (this.state.miles.milesEnd / this.state.miles.milesStep); i++) {
            this.state.miles.milesList.push(this.state.miles.milesStart * (i + 1));
        }
        console.log(this.state.miles.milesList);
    }

    render () {
        let miles = null;
        miles = (
            <div className = 'params-choice'>
                <label for = 'miles'>Choose the Average number of Miles you drive per year</label>
                <div>
                    <select id = 'miles' className = 'select'>
                        {this.state.miles.milesList.map((miles, index) => {
                        return <MileOption
                            miles = {miles}
                            key = {miles}/>
                        })}
                    </select>
                </div>
            </div>
          )
        return (
            <div>
                <CurrentRate currentRate = {this.state.currentRate}/>
                {miles}
                {/*<TimeOfDay/> */}
            </div>
        )
    }
};

export default Params;