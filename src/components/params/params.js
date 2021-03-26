import React, {Component} from 'react';
import Papa from 'papaparse';
import CurrentRate from './currentRate';
import MileOption from './mileOption';
import ChargingHourOption from './chargingHourOption';
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
        chargingHours : [ 'Midnight to 6am', '6am to Noon', 'Noon to 6pm', '6pm to Midnight'],
        selectedParams: {
            currentRate: 'Rate A',
            miles: 1000,
            hours: 'Midnight to 6am'
        },
        loadProfile:[]
    }

    componentWillMount() {
        for(var i = 0; i < (this.state.miles.milesEnd / this.state.miles.milesStep); i++) {
            this.state.miles.milesList.push(this.state.miles.milesStart * (i + 1));
        }
    }

    changeRateHandler = (e) => {
        this.setState({
            selectedParams: {
                currentRate: e.target.value
            }
        });
    }

    changeMilesHandler = (e) => {
        this.setState({
            selectedParams: {
                miles: e.target.value
            }
        });
    }

    changeHoursHandler = (e) => {
        this.setState({
            selectedParams: {
                hours: e.target.value
            }
        });
    }

    render () {
        let miles = null;
        let chargingHours = null;
        miles = (
            <div className = 'params-choice'>
                <label for = 'miles'>Choose the Average number of Miles you drive per year</label>
                <div>
                    <select id = 'miles' className = 'select' onChange={this.changeMilesHandler}>
                        {this.state.miles.milesList.map((miles, index) => {
                        return <MileOption
                            miles = {miles}
                            key = {miles}/>
                        })}
                    </select>
                </div>
            </div>
          )

        chargingHours = (
            <div className = 'params-choice'>
                <label for = 'charging-hours'>Choose the hours you plan to charge your EV</label>
                <div>
                    <select id = 'charging-hours' className = 'select' onChange={this.changeHoursHandler} >
                        {this.state.chargingHours.map((hours, index) => {
                            return <ChargingHourOption
                                hours = {hours}
                                key = {hours}/>
                            })}
                    </select>
                </div>
            </div>
        )  
        return (
            <div>
                <CurrentRate currentRate = {this.state.currentRate} change = {this.changeRateHandler}/>
                {miles}
                {chargingHours}
            </div>
        )
    }
};

export default Params;