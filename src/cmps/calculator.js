import React from 'react';
import CalcButton from './calcbutton';
import Display from './display';

const INT_STATE = {
  eq: "", //The current equation
  curr: "0", //What is currently displayed
  result: "" //If the equals button has been pressed it will equal the result of the current equal, otherwise nothing
};
const OP_REG = /[\+\-\×\÷]{1}/;
const SIGN_REG = /[\+\-]{1}/;
const NEG_REG = /[\-]{1}/;
const NON_NEG_REG = /[\+\×\÷]{1}/;

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = INT_STATE;
    this.handleInput = this.handleInput.bind(this);
    this.clearEntry = this.clearEntry.bind(this);
    this.handleOp = this.handleOp.bind(this);
    this.handleEquals = this.handleEquals.bind(this);
    this.handleDec = this.handleDec.bind(this);
    this.handleNum = this.handleNum.bind(this);
    this.nextNumber = this.nextNumber.bind(this);
    this.evalOp = this.evalOp.bind(this);
    this.evaluate = this.evaluate.bind(this);
  }

  //Essesntially a reducer determining how button input is handled
  handleInput(value) {
    if (value == "A/C") {
      this.setState(INT_STATE);
    } else if(value == "CE"){
      this.clearEntry();
    }else if(OP_REG.test(value)) {
      this.handleOp(value);
    } else if (value == "=") {
      this.handleEquals(value);
    } else if (value == ".") {
      this.handleDec(value);
    } else {
      this.handleNum(value);
    }
  }

  //Clear the previous entry displayed on the screen
  clearEntry(){
    if(this.state.eq.length > 0){
      //Reset to the initial state if clearing directly after resolving an equation
    if(/[=]{1}/.test(this.state.eq)){
        this.setState(INT_STATE);
    }
    //Remove all of the first number in the equation if that number, used in the current equation, was the result of the previous equation
   else if(this.state.result == this.state.curr && this.state.curr == this.state.eq){
      this.setState(INT_STATE);
    }
    //Reset the program to the initial state if the first item in the equation is deleted and this equation does not use the result of the previous equation
    else if(this.state.result == "" && this.state.curr == this.state.eq && this.state.curr.length == 1){
       this.setState(INT_STATE);
     }
     //If the current entry for the equation is a number with more than one digit, remove the one farthest from the right
    else if(this.state.curr.length > 1){
        this.setState({eq: this.state.eq.slice(0,this.state.eq.length-1), curr: this.state.curr.slice(0,this.state.curr.length-1),result: this.state.result});
    }
      //If the current entry is an operator, the last one must be a number of unknown length
    else if(OP_REG.test(this.state.curr)){
        let i = this.state.eq.length-2;
        let temp = "";
        while(i>=0 && OP_REG.test(this.state.eq[i]) == false){
          temp = this.state.eq[i] + temp;
          i--;
        }
        this.setState({eq:this.state.eq.slice(0,this.state.eq.length-1), curr:temp,
                      result: this.state.result});
      }
      //If the current entry is a number, the last one must be an operator
    else{
       this.setState({eq:this.state.eq.slice(0,this.state.eq.length-1), curr:this.state.eq[this.state.eq.length-2],
                      result: this.state.result});
     }
    }
  }
  
  handleOp(value) {
    let newEq = this.state.eq;
    let now = this.state.curr;
   if (newEq.length == 0 && !SIGN_REG.test(value)) { //Cannot start an equation with multiplication or division
      newEq = "";
    } 
     else if (NEG_REG.test(newEq[newEq.length - 1]) && NEG_REG.test(value) && OP_REG.test(newEq[newEq.length - 2]) ) {
       
    } 
    else if (NEG_REG.test(newEq[newEq.length - 1]) && NON_NEG_REG.test(value)) {
      if (OP_REG.test(newEq[newEq.length - 2])) {
        newEq = newEq.slice(0, newEq.length - 2) + value;
      } else {
        newEq = newEq.slice(0, newEq.length - 1) + value;
      }
      now = value;
    } 
    else if (OP_REG.test(newEq[newEq.length - 1]) && NON_NEG_REG.test(value)) {
      newEq = newEq.slice(0, newEq.length - 1) + value;
      now = value;
    } 
    
    
    else if (this.state.result == now) { //If you are using the result of the previous equation in a new equation
      newEq = this.state.result  + value;
      now = value;
    } else {
      newEq = newEq + value;
      now = value;
    }
    this.setState({
      eq: newEq,
      curr: now,
      result: this.state.result
    });
  }

  handleEquals(value) {
    let newEq = this.state.eq + value;
    let now = this.state.curr;
    let final = this.state.result ;
    if (this.state.eq.length == 0) {//Cannot start an equation with an equals sign
      newEq = "";
    } else if (final != this.state.eq && !OP_REG.test(this.state.eq[this.state.eq.length - 1]) //Can only finish an equation if it is not already finished or the previous button pressed was an operator
    ) {     
      final = this.evaluate(newEq);
      newEq = newEq + final;
      now = final;
    }
    this.setState({ eq: newEq, curr: now, result: final });
  }

  handleDec(value) {
    let newEq = this.state.eq + value;
    let now = this.state.curr;
    if (this.state.eq.length == 0) { //If the first button clicked was a decimal, make sure it has a zero in front of it
      newEq = "0.";
      now = newEq;
    } else if (/\./.test(now)||this.state.result == now || OP_REG.test(this.state.eq[this.state.eq.length - 1])) //Cannot click decimal button if the current number already has a decimal, the equation has ended or the last button pressed was an operator
    {
      newEq = this.state.eq;
    } else {
      now = now + ".";
    }
    this.setState({ eq: newEq, curr: now, result: this.state.result });
  }

  handleNum(value) {
    let newEq = this.state.eq + value;
    let now = this.state.curr;
    let final = this.state.result;
    if (value == "0" && (now == "0" || now == "-0" || now == "+0" )) {// only allow the first digit in a number to be zero (for decimal numbers) 
      newEq = this.state.eq;
    } else if (final == now) { // Just finished an equation but not using the result in the next equation
      newEq = value;
      now = value;
      final = "";
    }
    else if(OP_REG.test(now) && now.length != this.state.eq.length){ //if the previous button clicked was an operator but was not the first button clicked
            now = value;
    } 
    else if((now == "+0" || now == "-0") && value != "0") { // at start of equation do not allow leading zero
       newEq = this.state.eq.slice(0,this.state.eq.length-1) + value;
       now = now[0] + value;
      
    }else if (now == "0" && value != "0")  { // during equation do not allow leading zeros
      newEq = this.state.eq.slice(0,this.state.eq.length-1) + value;
       now = value;
    } 
    else {
      now = now + value;
    }
    this.setState({
      eq: newEq,
      curr: now,
      result: final
    });
  }

  //Return the string representation of the next floating point number in the equation starting from position
  //startPos in the provided text
  nextNumber(text, startPos) {
    let start = startPos;
    let end = text.length - 1;
      if (NEG_REG.test(text[startPos])) {
      start = start + 1;
    }
    for (let i = start; i < text.length; i++) {
      if (OP_REG.test(text[i]) || text[i] == "=") {
        end = i - 1;
        break;
      }
    }
    return end + 1;
  }

  //apply an operator to two numbers
  evalOp(num1, num2, op) {
    if (op == "+") {
      return num1 + num2;
    } else if (op == "-") {
      return num1 - num2;
    } else if (op == "×") {
      return num1 * num2;
    } else if (op == "÷") {
      return num1 / num2;
    }
    return undefined;
  }

  //Turns the equation the user inputed through the buttons into a resulting number
  evaluate(value) {
    let total = 0;
    let pos = 0;
    if (SIGN_REG.test(value[0])) {
      pos = this.nextNumber(value, 1);
      total = parseFloat(value[0] + value.slice(1, pos));
    } else {
      pos = this.nextNumber(value, 0);
      total = parseFloat(value.slice(0, pos));
    }
    while (value[pos] != "=") {
      console.log("value: " + value + " pos: " + pos + " value[pos]: "  + value[pos] +  " total: " + total);
      let end = this.nextNumber(value, pos + 1);
      console.log("next number: " + (parseFloat(value.slice(pos + 1, end))));
      total = this.evalOp(total, parseFloat(value.slice(pos + 1, end)), value[pos]);
      pos = end;
    }
    //return parseFloat(total.toFixed(4)).toString();
    return total.toString();
  }

  render() {
    const butText = [
       ["clear", "A/C"], 
         ["clear_entry", "CE"], 
      ["divide", "÷"],   
       ["seven", "7"],
      ["eight", "8"],
      ["nine", "9"],
      ["multiply", "×"],
      ["four", "4"],
      ["five", "5"],
      ["six", "6"],
   ["subtract", "-"],
      ["one", "1"],
      ["two", "2"],
      ["three", "3"],
         ["add", "+"],
      ["zero", "0"],
      ["decimal", "."],
      ["equals", "="],
    ];
    let buttonList = [];
    for (let i = 0; i < 18; i++) {
      buttonList.push(
        <CalcButton
          id={butText[i][0]}
          value={butText[i][1]}
          handler={this.handleInput}
        />
      );
    }
    return (
      <div id="calc_container">
        <Display eq={this.state.eq} curr={this.state.curr} />
        <div id="button_cont">
         {buttonList}
        </div>
      </div>
    );
  }
}
export default Calculator;