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
        yearlyUsageBeforeA: 0,
        yearlyBillBeforeA: 0,
        yearlyUsageAfterA: 0,
        yearlyBillAfterA: 0,
        yearlyUsageBeforeB: 0,
        yearlyBillBeforeB: 0,
        yearlyUsageAfterB: 0,
        yearlyBillAfterB: 0,
        billImpactA: 0,
        billImpactB: 0,
        touFlag: false,
        recommendation: 'Recommendation'
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

    calcBillImpactA = () => {
        var totalUsageBeforeA = 0;
        var totalBillBeforeA = 0;
        var totalUsageAfterA = 0;
        var totalBillAfterA = 0;
        var billImpactA = 0;
        this.state.loadProfile.map((loadDay, dayIndex) => {
            loadDay.map((loadData, dataIndex) => {
                if (dataIndex === 1) {
                    totalUsageBeforeA += parseFloat(loadData);
                    totalBillBeforeA += (0.15 * parseFloat(loadData));
                }
            });
        });
        totalBillBeforeA = Math.round(totalBillBeforeA);
        this.setState({
            yearlyUsageBeforeA: totalUsageBeforeA,
            yearlyBillBeforeA: totalBillBeforeA
        });
        totalUsageAfterA = totalUsageBeforeA + (0.3 * this.state.milesSelected);
        totalBillAfterA = Math.round(totalBillBeforeA + (0.3 * 0.15 * this.state.milesSelected));
        this.setState({
            yearlyUsageAfterA: totalUsageAfterA,
            yearlyBillAfterA: totalBillAfterA
        });
        billImpactA = totalBillAfterA - totalBillBeforeA;
        this.setState({
            billImpactA: billImpactA
        });
        return billImpactA;
    }

    calcBillImpactB = () => {
        var totalUsageBeforeB = 0;
        var totalBillBeforeB = 0;
        var totalUsageAfterB = 0;
        var totalBillAfterB = 0;
        var billImpactB = 0;
        this.state.loadProfile.map((loadDay, dayIndex) => {
            loadDay.map((loadData, dataIndex) => {
                if ((dataIndex === 0) 
                && ((loadData.indexOf('13:00:00') > -1) || 
                    (loadData.indexOf('14:00:00') > -1) || 
                    (loadData.indexOf('15:00:00') > -1) || 
                    (loadData.indexOf('16:00:00') > -1) || 
                    (loadData.indexOf('17:00:00') > -1) || 
                    (loadData.indexOf('18:00:00') > -1))) {
                    this.setState({
                        touFlag: true
                    });
                } else {
                    this.setState({
                        touFlag: false
                    });
                }
                if (dataIndex === 1) {
                    totalUsageBeforeB += parseFloat(loadData);
                    if(this.state.touFlag) {
                        totalBillBeforeB += (0.2 * parseFloat(loadData));
                    } else {
                        totalBillBeforeB += (0.08 * parseFloat(loadData));
                    }
                }
            });
        });
        totalBillBeforeB = Math.round(totalBillBeforeB);
        this.setState({
            yearlyUsageBeforeB: totalUsageBeforeB,
            yearlyBillBeforeB: totalBillBeforeB
        });

        totalUsageAfterB = totalUsageBeforeB + (0.3 * this.state.milesSelected);
        if((this.state.hoursSelected === 'Noon to 6pm')) {
            totalBillAfterB = Math.round(totalBillBeforeB + (0.3 * 0.2 * this.state.milesSelected));
        } else {
            totalBillAfterB = Math.round(totalBillBeforeB + (0.3 * 0.08 * this.state.milesSelected));
        }
        this.setState({
            yearlyUsageAfterB: totalUsageAfterB,
            yearlyBillAfterB: totalBillAfterB
        });
        billImpactB = totalBillAfterB - totalBillBeforeB;
        this.setState({
            billImpactB: billImpactB
        });
        return billImpactB;
    }

    determineRecommendation = (billImpactA, billImpactB) => {
        if(this.state.currentRateSelected === 'Rate A') {
            if (billImpactA > billImpactB) {
                this.setState({
                    recommendation: 'Please switch to the more cost efficient plan -  \'Rate B\''
                });
            } else {
                this.setState({
                    recommendation: 'Congratulations! You are already on the most cost efficient plan - \'Rate A\''
                });
            }
        } else if(this.state.currentRateSelected === 'Rate B') {
                if (billImpactA > billImpactB) {
                    this.setState({
                        recommendation: 'Congratulations! You are already on the most cost efficient plan - \'Rate B\''
                    });
            } else {
                this.setState({
                    recommendation: 'Please switch to the more cost efficient plan -  \'Rate A\''
                });
            }
        }
    }

    evaluateDollarAmount = (e) => {
        var billImpactA = 0;
        var billImpactB = 0;
        this.setState({
            calcDollarAmount: true
        });
        billImpactA = this.calcBillImpactA();
        billImpactB = this.calcBillImpactB();
        this.determineRecommendation(billImpactA, billImpactB);
    }

    render () {
        let miles = null;
        let chargingHours = null;
        let findings = null;
        miles = (
            <div className = 'params-choice'>
                <label for = 'miles'>Select the Average number of Miles you drive per year</label>
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
                <label for = 'charging-hours'>Select the hours you plan to charge your EV</label>
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
                            <p>The <em>yearly</em> impact on your electric bill with</p>
                            <ul className = 'findings-list'>
                                <li>Rate A - <b>${this.state.billImpactA}</b></li>
                                <li>Rate B - <b>${this.state.billImpactB}</b></li>
                            </ul>
                            <p>Our Recommendation: <b>{this.state.recommendation}</b></p>
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
                    <CurrentRate currentRate = {this.state.currentRate} change = {this.changeRateHandler} val = {this.state.currentRateSelected}/>
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