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
     focus_index : 0,
     demonstrate_sel: null,
     demonstrate_index: null,
     staged_sel : null,//this.props.skill_applications[0].selection,
     // staged_index : 0,
     staged_index : null,
     ...this.group_skill_apps(this.props.skill_applications,{})
     // z_order: [...Array((sk_apps || []).length).keys()]
    }

  }

  group_skill_apps(next_sk_apps,prev_sk_apps){
    let selection_groups = {}
    // let toggleCallback_groups = {}
    let selection_order = []
    let first_sel;
    for (let j=0; j < next_sk_apps.length; j++){
      let skill_app = next_sk_apps[j] 
      let sel = skill_app.selection
      if(!first_sel){first_sel = sel}
      
      let sel_g = []
      // let cb_g = []
      // let index
      if(sel in selection_groups){
        sel_g = selection_groups[sel]
        // index = sel_g[0].index
        // cb_g = toggleCallback_groups[sel]
      }else{
        selection_order.push(sel)
      }

      // let i = sel_g.length
      // let cb = (nxt)=>{
      //   console.log("CALLBACK",sel,i,nxt)
      //   let sgs = this.state.selection_groups
      //   // let i = this.state.selection_order[j]
      //   sgs[sel][i] = {...sgs[sel][i],reward:nxt.correct ? 1 : -1}
      //   this.setState({selection_groups:sgs})
      // }

      sel_g.push({...skill_app})
      // cb_g.push(cb)
      selection_groups[sel] = sel_g
      // toggleCallback_groups[sel] = cb_g
      
    }
    return {//staged_sel : first_sel,
            //staged_index : 0,
            selection_order: selection_order,
            selection_groups: selection_groups,
            // toggleCallback_groups: toggleCallback_groups}
          }
  }

  findDefaultStaged(){
    for (let sel in this.state.selection_groups){
      let sg = this.state.selection_groups[sel]
      for (let i=0; i<sg.length; i++){
        let skill_app = sg[i]
        if(skill_app.reward > 0){
          return [skill_app.selection, i]
        }
      }
    }
    return [null, null]

  }

  componentDidUpdate(prevProps) {
    let prev_sk_apps = prevProps.skill_applications || []
    let next_sk_apps = this.props.skill_applications || []
    if (!deep_equal(prev_sk_apps, next_sk_apps)) {
      this.setState(this.group_skill_apps(next_sk_apps,prev_sk_apps))
    }
    
  }

  render(){
    // console.time('overlay_rerender')



    
    // let skill_applications = this.props.skill_applications
    let {bounding_boxes, where_colors} = this.props
    let skill_boxes = []
    let possibilities = []
    let highlights = []
    let connectors = []
    console.log('\n\nrender overlay\n\n')
    let {staged_sel, staged_index,
         demonstrate_sel, demonstrate_index} = this.state
    // let staged_sel = this.state.staged_sel 
    // let staged_index = this.state.staged_index
    // console.log("R)
    let using_default_staged = false
    if(staged_sel == null || staged_index == null){
      [staged_sel,staged_index] = this.findDefaultStaged()
      using_default_staged = true
    }
    if(staged_sel == null || staged_index == null){
      staged_sel = Object.keys(this.state.selection_groups)[0]
      staged_index = 0
    }


    
    let j=0
    for (let sel of this.state.selection_order){
      let sg = this.state.selection_groups[sel]
      let bounds = bounding_boxes[sel]

      // let staged_index
      // if(this.state.staged_sel==sel && this.state.staged_index != null){
      //   staged_index = this.state.staged_index
      // }

      let hasFocus = false
      let skill_app_index;
      if(sel === this.state.focus_sel){
        skill_app_index = this.state.focus_index
        console.log("FOCUS_INDEX", this.state.focus_index)
        let skill_app = sg[skill_app_index]
        console.log("SELECTED", skill_app)
        if(skill_app && skill_app.foci_of_attention){

          for (let k=0; k < skill_app.foci_of_attention.length; k++){
            let foa = skill_app.foci_of_attention[k]
            console.log("FOCI", foa)
            highlights.push(
              <SkillAppProposal bounds={bounding_boxes[foa]}
                                color = {where_colors[k+1]}
                                hasFocus={true}
                                key={'foa'+k.toString()}/>
            )
          }
        }
        hasFocus = true
      }else if(staged_sel == sel){
        skill_app_index = staged_index
        // skill_app = sg[staged_index]
      }else{
        skill_app_index = sg.findIndex(sa => sa.reward > 0) || 0; 
        if(skill_app_index == -1){skill_app_index = 0} 
      }
      console.log("BLOOP",sel,staged_sel,staged_index,using_default_staged)
      let skill_app = sg[skill_app_index]
      let correct = skill_app.reward > 0
      let incorrect = skill_app.reward < 0
      let is_demonstation = skill_app.stu_resp_type == "HINT_REQUEST"

      let focusCallback = (index)=>{

       console.log("Set FOCUS", sel,index)
       this.state.selection_order.splice(
          this.state.selection_order.indexOf(sel),1)
       let new_sel_order = [...this.state.selection_order,sel]
       this.setState({"focus_sel" : sel,"focus_index":index, selection_order: new_sel_order})
       console.log("selection_order",new_sel_order)
      }

      let stageCallback = (index)=>{
        console.log("STAGE", sel,index)
        if(this.state.staged_sel == sel && this.state.staged_index == index ){
          this.setState({"staged_sel" : null,"staged_index": null})
        }else{
          this.setState({"staged_sel" : sel,"staged_index": index})  
        }
      }

      let demonstrateCallback = (action,input)=>{
        let _sgs = this.state.selection_groups
        _sgs[sel].push({
                selection:sel,
                action: action,
                input:input,
                stu_resp_type : "HINT_REQUEST",
                reward:1})
        focusCallback(_sgs[sel].length-1)
        this.setState({selection_groups : _sgs})
      }

      let toggleCallback = (nxt,index)=>{
        console.log("CALLBACK",sel,index,nxt)
        let _sgs = this.state.selection_groups
        // let i = this.state.selection_order[j]
        _sgs[sel][index] = {..._sgs[sel][index],reward:nxt.correct ? 1 : -1}
        this.setState({selection_groups:_sgs})
      }

      let removeCallback = (index)=>{
        let _sgs = this.state.selection_groups
        let fi = this.state.focus_index
        let fs = this.state.focus_sel
        _sgs[sel].splice(index,1)
        if(_sgs[sel].length == 0){
          delete _sgs[sel]
        }
        fi = fi >= index ? (fi - 1) : fi
        if(fi < 0){[fs,fi] = [selection_order[0],0]}
        this.setState({selection_groups : _sgs,
                       focus_sel: fs,
                       focus_index: fi})
      }

      possibilities.push(
        <SkillAppProposal
          key={sel}
          bounds={bounds}
          staged={staged_sel == sel && staged_index == skill_app_index}
          skill_app={skill_app}
          hasFocus={hasFocus}
          correct={correct}
          incorrect={incorrect}
          is_demonstation={is_demonstation}
          //demonstrating={demonstrate_sel == sel && staged_index == skill_app_index}
          demonstrateCallback={demonstrateCallback}
        />        
      )

      
      
      console.log("BLEEP", staged_sel == sel ? staged_index : null)
      skill_boxes.push(
        <SkillAppBox
          zIndex={j}
          focusCallback = {focusCallback}
          initial_pos ={{x: bounds.x+bounds.width+10, y: bounds.y-70}}//{{x: 0, y: 0}}
          staged_index ={staged_sel == sel ? staged_index : null}
          using_default_staged={using_default_staged}
          focus_index ={this.state.focus_index}
          key={sel}
          skill_applications={sg}
          hasFocus={hasFocus}
          toggleCallback={toggleCallback}
          stageCallback={stageCallback}
          removeCallback={removeCallback}
        />
      )
      j++
    }


    const out = (
      <View style={{height:"100%", width:"100%" }}>
        {highlights}
        {possibilities}
        {skill_boxes}
        
      </View>)
    // console.timeEnd('overlay_rerender')
    return out
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

SkillOverlay.defaultProps = {
  where_colors: [  "darkorchid",  "#ff884d",  "#52d0e0",
                   "#feb201",  "#e44161", "#ed3eea",
                   "#2f85ee",  "#562ac6", "#cc24cc"],
}


export default SkillOverlay;
