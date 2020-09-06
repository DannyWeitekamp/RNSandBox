import React, { Component, createRef } from 'react'
import { TouchableHighlight, TouchableNativeFeedback,ScrollView,View, Text, StyleSheet,
         Animated, PanResponder,useRef,Platform } from "react-native";
import autobind from "class-autobind";


import {simple_animate, gen_shadow} from "./vis_utils.js"

class SkillAppProposal extends Component {
  constructor(props){
    super(props);
    autobind(this);
    let elevation = (props.hasFocus && props.focused_elevation)
                    ||  props.default_elevation
    if(Platform.OS != 'web'){
      elevation = new Animated.Value(elevation);  
    }

    const scale_anim = new Animated.Value(1,
      {useNativeDriver: true});
    this.state = {elevation,scale_anim};
  }
  _update_scale_elevation(){
    this._animate_scale_elevation(
      // (this.is_grabbed && this.props.grabbed_scale) ||
      (this.props.hasFocus && this.props.focused_scale) || 
       this.props.default_scale,

      // (this.is_grabbed && this.props.grabbed_elevation) || 
      (this.props.hasFocus && this.props.focused_elevation) || 
      this.props.default_elevation
      );
  }
  _animate_scale_elevation(next_scale,next_elevation,config={useNativeDriver:true,speed: 40}){
    Animated.spring(
    this.state.scale_anim, // Auto-multiplexed
    { toValue: next_scale,...config,...{useNativeDriver:true} }
    ).start();
    // simple_animate(this,'elevation',next_size,config)
    if(Platform.OS == 'web'){
      simple_animate(this,'elevation',next_elevation,config)
    }else{
      Animated.spring(
      this.state.elevation, // Auto-multiplexed
      { toValue: next_elevation,...config,...{useNativeDriver:true} }
      ).start();
    }

  }
  componentDidUpdate(prevProps) {
    if (prevProps.hasFocus !== this.props.hasFocus) {
      this._update_scale_elevation()
      // this.updateAndNotify();
    }
  }
  render(){
    let skill_app = this.props.skill_app || {}
    let text = (skill_app.input || "")//.value || ""
    let bounds = this.props.bounds;
    let hasFocus = this.props.hasFocus;
    let fontSize = (Math.max(bounds.width,100)/Math.min(text.length,6))*.9
    let shadow_props = gen_shadow(this.state.elevation);

    return <Animated.View  style= {[{position : "absolute",
                       borderWidth: (hasFocus && 8) || 4,
                       borderRadius: 10,
                       borderColor: (hasFocus && "purple") || "gray",
                       width:bounds.width,
                       height:bounds.height,
                       justifyContent: "center",
                      transform: [
                        {translateX : bounds.x},
                        {translateY : bounds.y},
                        ]
                    },shadow_props]
        }>
          <Text
            style = {{
              alignSelf: "center",
              color : (hasFocus && "purple") || "gray",
              fontSize : fontSize,
              // fontWeight: (hasFocus && "bold") || "",
            }}
                >
            {text}
          </Text>
        </Animated.View>
  }
}

SkillAppProposal.defaultProps = {
  focused_scale : 1.025,
  default_scale : 1,
  hasFocus : false,
  focused_elevation : 14,
  default_elevation : 2
}

export default SkillAppProposal
