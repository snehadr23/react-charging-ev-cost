import React, {Component} from 'react';
import CurrentRate from './currentRate';
import MileOption from './mileOption';
import ChargingHourOption from './chargingHourOption';
import loadProfileData from '../../assets/data/USA_NY_Buffalo.725280_TMY2.csv';
import Papa from 'papaparse';
import axios from 'axios';
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
        currentRateSelected: 'Rate A',
        milesSelected: 1000,
        hoursSelected: 'Midnight to 6am',
        loadProfile:[],
        loadProfileAvailable: false,
        calcDollarAmount: false,
        yearlyUsageBefore: 0,
        yearlyBillBefore: 0,
        yearlyUsageAfter: 0,
        yearlyBillAfter: 0
    }

    componentWillMount() {
        for(var i = 0; i < (this.state.miles.milesEnd / this.state.miles.milesStep); i++) {
            this.state.miles.milesList.push(this.state.miles.milesStart * (i + 1));
        }

        axios.get(loadProfileData)
        .then(res => {
            var parsedLoadProfileData = Papa.parse(res.data);
            parsedLoadProfileData.data.shift();
            this.setState({
                loadProfile: parsedLoadProfileData.data,
                loadProfileAvailable: true
            });
        });
    }

    changeRateHandler = (e) => {
        this.setState({
            currentRateSelected: e.target.value
        });
    }

    changeMilesHandler = (e) => {
        this.setState({
            milesSelected: e.target.value
        });
    }

    changeHoursHandler = (e) => {
        this.setState({
            hoursSelected: e.target.value
        });
    }

    evaluateDollarAmount = (e) => {
        var totalUsageBefore = 0;
        var totalBillBefore = 0;
        var totalUsageAfter = 0;
        var totalBillAfter = 0;
        console.log('miles: ', this.state.milesSelected);
        console.log('rate: ', this.state.currentRateSelected);
        console.log('hours: ', this.state.hoursSelected);
        this.setState({
            calcDollarAmount: true
        });
        if(this.state.currentRateSelected === 'Rate A') {
            this.state.loadProfile.map((loadDay, dayIndex) => {
                loadDay.map((loadData, dataIndex) => {
                    if (dataIndex === 1) {
                        totalUsageBefore += parseFloat(loadData);
                        totalBillBefore += (0.15 * parseFloat(loadData));
                    }
                });
            });
            totalBillBefore = Math.round(totalBillBefore);
            this.setState({
                yearlyUsageBefore: totalUsageBefore,
                yearlyBillBefore: totalBillBefore
            });
            console.log('totalBillBefore: ', totalBillBefore);
            console.log('totalUsageBefore: ', totalUsageBefore);
            totalUsageAfter = totalUsageBefore + (0.3 * this.state.milesSelected);
            totalBillAfter = Math.round(totalBillBefore + (0.3 * 0.15 * this.state.milesSelected));
            this.setState({
                yearlyUsageAfter: totalUsageAfter,
                yearlyBillAfter: totalBillAfter
            });
            console.log('avg mile/yr: ', this.state.milesSelected);
            console.log('totalUsageAfter: ', totalUsageAfter);
            console.log('totalBillAfter: ', totalBillAfter);

        } else if (this.state.currentRateSelected === 'Rate B') {
            console.log('Current Rate Selected: Rate B');
        }
    }

    render () {
        let miles = null;
        let chargingHours = null;
        let findings = null;
        miles = (
            <div className = 'params-choice'>
                <label for = 'miles'>Choose the Average number of Miles you drive per year</label>
                <div>
                    <select id = 'miles' className = 'select' onChange={this.changeMilesHandler} value = {this.state.milesSelected}>
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
                    <select id = 'charging-hours' className = 'select' onChange={this.changeHoursHandler} value = {this.state.hoursSelected} >
                        {this.state.chargingHours.map((hours, index) => {
                            return <ChargingHourOption
                                hours = {hours}
                                key = {index + 1}/>
                            })}
                    </select>
                </div>
            </div>
        )

        if (this.state.calcDollarAmount) {
            findings = (
                <div className = 'findings after'>
                    <p>Based on your selection</p>
                    <div className = 'findings-details'>
                        <p>Your current electricity bill: ${this.state.yearlyBillBefore}</p>
                        <p>Your electricity bill after EV purchase: ${this.state.yearlyBillAfter}</p>
                        <p>The <em>yearly</em> difference after EV purchase: <b>${this.state.yearlyBillAfter - this.state.yearlyBillBefore}</b></p>
                    </div>
                </div>
            )
        } else {
            findings = (
                <div className = 'findings before'>
                    <p>Check for the analysis here!</p>
                </div>
            )
        }
        return (
            <div>
                <div className = 'params'>
                    <CurrentRate currentRate = {this.state.currentRate} change = {this.changeRateHandler} val = {this.state.hoursSelected}/>
                    {miles}
                    {chargingHours}
                    <button className = 'btn' onClick = {this.evaluateDollarAmount}>Evaluate</button>
                </div>
                {findings}
            </div>
        )
    }
};

export default Params;