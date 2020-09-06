import Svg, {
  Circle,
  Ellipse,
  G,
  Text as SvgText,
  TSpan,
  TextPath,
  Path,
  Polygon,
  Polyline,
  Line,
  Rect,
  Use,
  Image,
  Symbol,
  Defs,
  LinearGradient,
  RadialGradient,
  Stop,
  ClipPath,
  Pattern,
  Mask,
} from 'react-native-svg';

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { TouchableHighlight, ScrollView,View, Text, StyleSheet,
         Animated, PanResponder,TouchableWithoutFeedback} from "react-native";
// import { TouchableOpacity} from 'react-native-gesture-handler'         
import autobind from "class-autobind";
import SkillAppBox from './skill_app_box.js'

class SkillOverlay extends Component{
  constructor(props){
    super(props);
    autobind(this)
    this.state = {focus_index : 1}
  }

    
  // componentWillMount() {
  //   // Add a listener for the delta value change
  //   this._val = { x:0, y:0 }
  //   this.state.pan.addListener((value) => this._val = value);
  //   // Initialize PanResponder with move handling
  //   this.panResponder = PanResponder.create({
  //     onStartShouldSetPanResponder: (e, gesture) => true,
  //     onPanResponderMove: Animated.event([
  //       null, { dx: this.state.pan.x, dy: this.state.pan.y }
  //     ])
      
      
  //   });
  //   // adjusting delta value
  //   this.state.pan.setValue({ x:0, y:0})
  // }

  render(){
    let skill_applications = this.props.skill_applications
    let bounding_boxes = this.props.bounding_boxes
    let skill_boxes = []
    let possibilities = []
    console.log(skill_applications)

    for (let i=0; i < skill_applications.length; i++){
      let skill_app = skill_applications[i] 
      let bounds = bounding_boxes[skill_app.selection]
      console.log(i, skill_applications[i])
      // let panStyle = {
      //   transform : this.state.pan.getTranslateTransform()
      // }
      possibilities.push(
        <Rect
          strokeWidth="3"
          stroke="gray"
          fill="rgba(0,0,0,0)"
          {...bounds}
        />
      )
      let focusCallback = ()=>{
       console.log("Set FOCUS", i)
       this.setState({"focus_index" : i})
      }
      let hasFocus= (this.state.focus_index==i)
      console.log("hasFocus",hasFocus,i)
      skill_boxes.push(
        //<Animated.View  {...this.panResponder.panHandlers} styles={this.state.position.getLay}>
          //<TouchableWithoutFeedback onResponderReject={()=>{
          //  console.log("Set FOCUS", i)
          //  this.setState({"focus_index" : i})
          //}}>
            <SkillAppBox 
              //style={{position:'absolute',top:0,left:0,right:0,bottom:0}}
              focusCallback = {focusCallback}
              initial_pos ={{x: bounds.x+bounds.width+10, y: bounds.y-70}}//{{x: 0, y: 0}}
              key={i.toString()} skill_app={skill_app} hasFocus={hasFocus}
            />
          //</TouchableWithoutFeedback>
        // </View>
        //</Animated.View>
      )
    }
    return (
      <View style={{height:"100%", width:"100%" }}>
        <Svg  height="100%" width="100%" >
          {possibilities}
        </Svg>
        
        {skill_boxes}
          
        
      </View>)
  }
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    // top: 0,
    // right: 0,
    // bottom: 0,
    // left: 0,
    // flex: "100%",
    // justifyContent: "center",
    // alignItems: "center"
  },
})

export default SkillOverlay;
