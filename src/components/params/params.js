import React, {Component} from 'react';
import CurrentRate from './currentRate';
import MileOption from './mileOption';
import ChargingHourOption from './chargingHourOption';
import loadProfileData from '../../assets/data/USA_NY_Buffalo.725280_TMY2.csv';
import Papa from 'papaparse';
import axios from 'axios';
import {BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
class Params extends Component {
    state = {
        currentRate: {   // electric plan options
            rateA : {
                desc: 'Flat rate - $0.15/kWh',
                name: 'Rate A'
            },
            rateB : {
                desc: 'TOU Rate - $0.20/kWh(Noon - 6pm), $0.08/kWh(Otherwise)',
                name: 'Rate B'
            }
        },
        miles : { // miles per year
            milesStart: 1000,
            milesStep: 1000,
            milesEnd: 100000,
            milesList: []
        },
        chargingHours : [ 'Midnight to 6am', '6am to Noon', 'Noon to 6pm', '6pm to Midnight'], // options for the user's charging hours
        currentRateSelected: 'Rate A', // electric plan selected by the user, defaults to 'Rate A'
        milesSelected: 1000, // miles per year selected by the user, defaults to '1000'
        hoursSelected: 'Midnight to 6am', // charging hours selected by the user, defaults to 'Midnight to 6am'
        loadProfile:[], // load profile from the CSV file
        loadProfileAvailable: false, // turns true after successful axios call
        calcDollarAmount: false, // turns true when the 'Evaluate' button is clicked
        yearlyUsageBeforeA: 0, // yearly electric usage on Rate A without EV charging
        yearlyBillBeforeA: 0, // yearly electric bill on Rate A without EV charging
        yearlyUsageAfterA: 0, // yearly electric usage on Rate A with EV charging
        yearlyBillAfterA: 0, // yearly electric bill on Rate A with EV charging
        yearlyUsageBeforeB: 0, // yearly electric usage on Rate B without EV charging
        yearlyBillBeforeB: 0, // yearly electric bill on Rate B without EV charging
        yearlyUsageAfterB: 0, // yearly electric usage on Rate B with EV charging
        yearlyBillAfterB: 0, // yearly electric bill on Rate B with EV charging
        billImpactA: 0, // yearly difference in bill with and without EV charging on Rate A
        billImpactB: 0, // yearly difference in bill with and without EV charging on Rate B
        touFlag: false, // a flag to denote the hour with spl rate on Rate B
        recommendation: null, // the recommendation for the user based on bill impact
        showChart: false // turns true when the user clicks 'Visualize findings', defaults to false
    }

    componentWillMount() {
        for(var i = 0; i < (this.state.miles.milesEnd / this.state.miles.milesStep); i++) {
            this.state.miles.milesList.push(this.state.miles.milesStart * (i + 1)); // populating the options for the list of miles/year
        }

        axios.get(loadProfileData) // getting data from CSV file
        .then(res => {
            var parsedLoadProfileData = Papa.parse(res.data); // parsing the response from the CSV file with 'Papaparse'
            parsedLoadProfileData.data.shift(); // removing the first entry with the column names
            this.setState({
                loadProfile: parsedLoadProfileData.data,
                loadProfileAvailable: true
            });
        });
    }

    changeRateHandler = (e) => { // handler to set state with user's selection for electric rate plan
        this.setState({
            currentRateSelected: e.target.value
        });
    }

    changeMilesHandler = (e) => { // handler to set state with user's selection for miles/year
        this.setState({
            milesSelected: e.target.value
        });
    }

    changeHoursHandler = (e) => { // handler to set state with user's selection for charging hours
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
        this.state.loadProfile.map((loadDay, dayIndex) => { // looping through array of days
            loadDay.map((loadData, dataIndex) => { // looping through array of data for one given day
                if (dataIndex === 1) { // if column 2 - 'Electricity:Facility [kWh](Hourly)'
                    totalUsageBeforeA += parseFloat(loadData); // calculate total electricity used on Rate A without EV charging
                    totalBillBeforeA += (0.15 * parseFloat(loadData)); // calculate total amount for the electricity used on Rate A without EV charging
                }
            });
        });
        this.setState({
            yearlyUsageBeforeA: totalUsageBeforeA,
            yearlyBillBeforeA: totalBillBeforeA 
        });
        totalUsageAfterA = totalUsageBeforeA + (0.3 * this.state.milesSelected); // total electric usage on Rate A with EV charging
        totalBillAfterA = (totalBillBeforeA + (0.3 * 0.15 * this.state.milesSelected)); // total bill on Rate A with EV charging
        this.setState({
            yearlyUsageAfterA: totalUsageAfterA,
            yearlyBillAfterA: totalBillAfterA
        });
        billImpactA = totalBillAfterA - totalBillBeforeA; // yearly difference in bill with and without EV charging
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
        this.state.loadProfile.map((loadDay, dayIndex) => { // looping through array of days
            loadDay.map((loadData, dataIndex) => { // looping through array of data for one given day
                if ((dataIndex === 0) // if column 1 - 'Date/Time' and
                && ((loadData.indexOf('13:00:00') > -1) || // if time of day is 1 pm or
                    (loadData.indexOf('14:00:00') > -1) || // if time of day is 2 pm or
                    (loadData.indexOf('15:00:00') > -1) || // if time of day is 3 pm or
                    (loadData.indexOf('16:00:00') > -1) || // if time of day is 4 pm or
                    (loadData.indexOf('17:00:00') > -1) || // if time of day is 5 pm or
                    (loadData.indexOf('18:00:00') > -1))) { // if time of day is 5 pm
                    this.setState({
                        touFlag: true // set the TOU flag to true
                    });
                } else {
                    this.setState({
                        touFlag: false
                    });
                }
                if (dataIndex === 1) { // if column 2 - 'Electricity:Facility [kWh](Hourly)'
                    totalUsageBeforeB += parseFloat(loadData); // calculate total electricity used on Rate B without EV charging
                    if(this.state.touFlag) {
                        totalBillBeforeB += (0.2 * parseFloat(loadData)); // calculate total amount for the electricity used on Rate B without EV charging with spl rate hour
                    } else {
                        totalBillBeforeB += (0.08 * parseFloat(loadData)); // calculate total amount for the electricity used on Rate B without EV charging with no spl rate hour
                    }
                }
            });
        });
        this.setState({
            yearlyUsageBeforeB: totalUsageBeforeB,
            yearlyBillBeforeB: totalBillBeforeB
        });

        totalUsageAfterB = totalUsageBeforeB + (0.3 * this.state.milesSelected); // total electricity usage with EV charging on Rate B
        if((this.state.hoursSelected === 'Noon to 6pm')) {
            totalBillAfterB = (totalBillBeforeB + (0.3 * 0.2 * this.state.milesSelected)); // total amount with EV charging on Rate B during spl rate hour
        } else {
            totalBillAfterB = (totalBillBeforeB + (0.3 * 0.08 * this.state.milesSelected)); // total amount with EV charging on Rate B during normal rate hour
        }
        this.setState({
            yearlyUsageAfterB: totalUsageAfterB,
            yearlyBillAfterB: totalBillAfterB
        });
        billImpactB = totalBillAfterB - totalBillBeforeB; // yearly difference in bill with and without EV charging
        this.setState({
            billImpactB: billImpactB
        });
        return billImpactB;
    }

    determineRecommendation = (billImpactA, billImpactB) => {
        if(this.state.currentRateSelected === 'Rate A') { // when user selected Rate A
            if (billImpactA > billImpactB) { // when impact on bill with Rate A is bigger than with Rate B
                this.setState({
                    recommendation: 'Please switch to the more cost efficient plan -  \'Rate B\''
                });
            } else {
                this.setState({
                    recommendation: 'Congratulations! You are already on the most cost efficient plan - \'Rate A\''
                });
            }
        } else if(this.state.currentRateSelected === 'Rate B') { // when user selected Rate A
                if (billImpactA > billImpactB) { // when impact on bill with Rate A is bigger than with Rate B
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

    chartFindings = () => {
        this.setState({
            showChart: true // when the user clicks'Visualize Findings'
        });
    }

    textFindings = () => {
        this.setState({
            showChart: false // when the user clicks 'Show Findings in text'
        })
    }

    evaluateDollarAmount = (e) => { // to evaluate user's choice to show impact and give recommmendation
        var billImpactA = 0;
        var billImpactB = 0;
        this.setState({
            calcDollarAmount: true
        });
        billImpactA = this.calcBillImpactA(); // calculate impact on bill with Rate A
        billImpactB = this.calcBillImpactB(); // calculate impact on bill with Rate B
        this.determineRecommendation(billImpactA, billImpactB); // to determine recommendation based the impacy on bills calculated
    }

    render () {
        let miles = null;
        let chargingHours = null;
        let findings = null;
        let chartData = [{ // input for chart
            plans: 'Plans',
            impact: 'Bill Impact',
            A: this.state.billImpactA,
            B: this.state.billImpactB
        }];
        miles = ( // HTML for 'Miles/year' driven by the user
            <div className = 'params-choice'>
                <label for = 'miles'>Select the Average number of Miles you drive per year</label>
                <div>
                    <select id = 'miles' className = 'select' onChange={this.changeMilesHandler} value = {this.state.milesSelected}>
                        {this.state.miles.milesList.map((miles, index) => {
                        return <MileOption // looping through the array of options for miles/year
                            miles = {miles}
                            key = {miles}/>
                        })}
                    </select>
                </div>
            </div>
          )

        chargingHours = ( // HTML for 'Charging hours' user plans to charge EV
            <div className = 'params-choice'>
                <label for = 'charging-hours'>Select the hours you plan to charge your EV</label>
                <div>
                    <select id = 'charging-hours' className = 'select' onChange={this.changeHoursHandler} value = {this.state.hoursSelected} >
                        {this.state.chargingHours.map((hours, index) => { // looping through the array of options for charging hours
                            return <ChargingHourOption
                                hours = {hours}
                                key = {index + 1}/>
                            })}
                    </select>
                </div>
            </div>
        )

        if (this.state.calcDollarAmount) {
            if (!this.state.showChart) { // findings in text
                findings = ( // HTML for findings and recommendation after evaluation
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
                        <button className = 'btn' onClick = {this.chartFindings}>Visualize these findings</button>
                    </div>
                )
            } else { // findings in chart
                findings = (
                    <div className = 'findings after'>
                        <BarChart
                            width={500}
                            height={350}
                            data={chartData}
                            margin={{
                                top: 50,
                                right: 30,
                                left: 20,
                                bottom: 5
                            }}>
                            
                            <XAxis dataKey='plans' />
                            <YAxis datakey='impact'/>
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="A" fill="#8884d8" />
                            <Bar dataKey="B" fill="#82ca9d" />
                        </BarChart>
                        <button className = 'btn' onClick = {this.textFindings}>Show findings in text</button>
                    </div>
                )
            }
        } else {
            findings = ( // HTML for findings and recommendation before evaluation
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