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
import SkillAppProposal from './skill_app_proposal.js'
import deep_equal from 'fast-deep-equal'

class SkillOverlay extends Component{
  constructor(props){
    super(props);
    autobind(this)
    let sk_apps =this.props.skill_applications 
    this.state = {
     focus_sel : this.props.skill_applications[0].selection,
     ...this.group_skill_apps(this.props.skill_applications,{})
     // z_order: [...Array((sk_apps || []).length).keys()]
    }

  }

  group_skill_apps(next_sk_apps,prev_sk_apps){
    let selection_groups = {}
    let toggleCallback_groups = {}
    let selection_order = []
    for (let j=0; j < next_sk_apps.length; j++){
      let skill_app = next_sk_apps[j] 
      let sel = skill_app.selection
      
      let sel_g = []
      let cb_g = []
      // let index
      if(sel in selection_groups){
        sel_g = selection_groups[sel]
        // index = sel_g[0].index
        cb_g = toggleCallback_groups[sel]
      }else{
        selection_order.push(sel)
      }

      let i = sel_g.length
      let cb = (nxt)=>{
        console.log("CALLBACK",sel,i,nxt)
        let sgs = this.state.selection_groups
        // let i = this.state.selection_order[j]
        sgs[sel][i] = {...sgs[sel][i],reward:nxt.correct ? 1 : -1}
        this.setState({selection_groups:sgs})
      }

      sel_g.push({...skill_app})
      cb_g.push(cb)
      selection_groups[sel] = sel_g
      toggleCallback_groups[sel] = cb_g
      
    }
    return {selection_order: selection_order,
            selection_groups: selection_groups,
            toggleCallback_groups: toggleCallback_groups}
  }

  componentDidUpdate(prevProps) {
    let prev_sk_apps = prevProps.skill_applications || []
    let next_sk_apps = this.props.skill_applications || []
    if (!deep_equal(prev_sk_apps, next_sk_apps)) {
      this.setState(this.group_skill_apps(next_sk_apps,prev_sk_apps))
    }
    
  }

  render(){
    let skill_applications = this.props.skill_applications
    let bounding_boxes = this.props.bounding_boxes
    let skill_boxes = []
    let possibilities = []
    let connectors = []
    console.log(this.state)

    
    let j=0
    for (let sel of this.state.selection_order){
      let sg = this.state.selection_groups[sel]
      let skill_app = sg[0]
      let sel = skill_app.selection
      let bounds = bounding_boxes[sel]
      let hasFocus = false
      let correct = false
      let incorrect = false
      if(sel === this.state.focus_sel){
          hasFocus = true
      }
      possibilities.push(
        <SkillAppProposal
          key={sel}
          bounds={bounds}
          skill_app={skill_app}
          hasFocus={hasFocus}
          correct={correct}
          incorrect={incorrect}
        />        
      )

      let focusCallback = ()=>{
       console.log("Set FOCUS", sel)
       this.state.selection_order.splice(
          this.state.selection_order.indexOf(sel),1)
       let new_sel_order = [...this.state.selection_order,sel]
       this.setState({"focus_sel" : sel, selection_order: new_sel_order})
       console.log("selection_order",new_sel_order)
      }

      
      skill_boxes.push(
        <SkillAppBox 
          zIndex={j}
          focusCallback = {focusCallback}
          initial_pos ={{x: bounds.x+bounds.width+10, y: bounds.y-70}}//{{x: 0, y: 0}}
          key={sel} skill_applications={sg} hasFocus={hasFocus}
          toggleCallbacks={this.state.toggleCallback_groups[sel]}
        />
      )
      


      j++
    }



    // for (let j=0; j < skill_applications.length; j++){
    //   let i = this.state.z_order[j]
    //   let skill_app = skill_applications[i] 
    //   let bounds = bounding_boxes[skill_app.selection]
    //   console.log(i, skill_applications[i])
    //   let hasFocus= (this.state.focus_index==i)

      
      
      
    //   console.log("hasFocus",hasFocus,i)
    //   skill_boxes.push(
    //     <SkillAppBox 
    //       zIndex={j}
    //       focusCallback = {focusCallback}
    //       initial_pos ={{x: bounds.x+bounds.width+10, y: bounds.y-70}}//{{x: 0, y: 0}}
    //       key={i.toString()} skill_applications={[skill_app]} hasFocus={hasFocus}
    //     />
    //   )
    // }
    return (
      <View style={{height:"100%", width:"100%" }}>
        {possibilities}
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
