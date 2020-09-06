import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { TouchableHighlight, TouchableNativeFeedback,ScrollView,View, Text, StyleSheet,
         Animated, PanResponder,useRef,Platform } from "react-native";
import { TouchableOpacity} from 'react-native-gesture-handler'


// import * as Animatable from 'react-native-animatable';
import autobind from "class-autobind";

import {simple_animate, gen_shadow} from "./vis_utils.js"

class AnimatedButton extends Component {
  constructor(props){
    super(props);
    autobind(this);
    const preinitial = this.props.preinitial || this.props.initial
    this.pos = new Animated.ValueXY({x: preinitial.x,y:preinitial.y})
    this.scale = new Animated.Value(preinitial.scale)
    this.is_pressed = false
    this.is_hover = false
    // this.state = {anim:anim};
  }
  componentDidMount(){
    this._animate_to(this.props.initial)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.parentHasFocus !== this.props.parentHasFocus) {
      this._animate_to( ((this.is_pressed || this.is_hover) && this.props.hover) ||
                          this.props.initial
      )
      // this.updateAndNotify();
    }
  }

  _animate_to(next,config){
    next = {...this.props.initial, ...next}
    console.log("next",next)
    Animated.parallel([
      Animated.spring(
      this.pos, // Auto-multiplexed
      { toValue: { x: next.x, y: next.y },...config,...{useNativeDriver : true} }
      ),
      Animated.spring(
      this.scale, // Auto-multiplexed
      { toValue: next.scale,...config,...{useNativeDriver : true}}
      )

    ]).start();
    
  }
  render(){
    // const animval = this.anim.getLayout()
    // console.log(this.props)
    // console.log(this.anim.scale)
    const anim_style = {//left: this.pos.x,
                        //top: this.pos.y,
                        // elevation : 100,
                        transform: [
                          {translateX : this.pos.x},
                          {translateY : this.pos.y},
                          {scale: this.scale}
                        ]}
    return (
      <Animated.View style={[{position : "absolute",},anim_style,{zIndex:9999}]}>
        <TouchableOpacity 
          
          //hitSlop={{left :20,top:20,right:20,bottom:20}}
          // style = {{elevation: 40}}
          //onPress={()=>this._animate_to(this.props.initial)}
          onMouseEnter={()=>{
            this.is_hover = true
            this._animate_to(this.props.hover,
            {speed: this.props.hover_animation_speed})}
          }
          onMouseLeave={()=>{
            this.is_hover = false
            this._animate_to(this.props.initial,
            {speed: this.props.hover_animation_speed})}
          }
          onPressIn={()=>{
            this.is_pressed = true
            this._animate_to(this.props.hover,
               {speed: this.props.hover_animation_speed}
               )
            }
          }
          onPress={()=>{
            this.is_pressed = false
            console.log("PRESSED")
            this._animate_to(this.props.initial,
              {speed: this.props.hover_animation_speed}
            )}
          }
          underlayColor="#919191"
        >
          {this.props.children}
        </TouchableOpacity>
      </Animated.View>
    )
  }
  // style={[styles.feedback_button,
  //                       staged && styles.staged_selected]}
}

class SkillAppBox extends Component{
  constructor(props){
    super(props);
    autobind(this)
    console.log('initial',props.initial_pos)
    // this.last_pos = {x: this.props.x || 0, y: this.props.y || 0}
    const position = new Animated.ValueXY();
    position.setOffset(this.props.initial_pos)


    let elevation = (props.hasFocus && props.focused_elevation)
                    ||  props.default_elevation
    if(Platform.OS != 'web'){
      elevation = new Animated.Value(elevation);  
    }
    
    // const shadow_height = new Animated.Value(0,
    //   {useNativeDriver: true});
    const scale_anim = new Animated.Value(1,
      {useNativeDriver: true});
    // const shadow_height = new Animated.Value(props.default_shadow_height,{useNativeDriver: false});
    this.main_content = createRef();
    this.anim_ref = null;
    this.elevation_anim_frame = 0
    this.is_grabbed = false
    const panResponder = PanResponder.create({
       onStartShouldSetPanResponder: () => true,

       onPanResponderGrant: (evt, gestureState) => {

        console.log("GRABBED")
        // this.setState({grabbed:true})
        // this._animate_shadow(this.props.grabbed_shadow_height);
        // this.setState({elevation: 60})
        // this.state.shadow_height.setValue(6)
        this.is_grabbed = true
        this._update_scale_elevation()
        // this._animate_scale_elevation(
        //   this.props.grabbed_scale,
        //   this.props.grabbed_elevation
        //   );
        this.props.focusCallback(evt)
        // let to_value = {shadowRadius : this.props.grabbed_shadow_height}
        // this.anim_ref.transitionTo(to_value,2000);
       },
       onPanResponderMove: (event, gesture) => {
          
          position.setValue({x: gesture.dx,
                              y: gesture.dy });
       },
       onStartShouldSetPanResponder: (evt, gestureState) => true,
       onStartShouldSetPanResponderCapture: (evt, gestureState) => {
          console.log(evt)
          return true
       },
        
       // onMoveShouldSetPanResponder: (evt, gestureState) => true,
       onPanResponderRelease: () => {
        console.log("Released")
        position.extractOffset();
        console.log(position.x._offset,position.y._offset)
        this.is_grabbed = false
        this._update_scale_elevation()
        // this.setState({grabbed:false})
        // let to_value = {shadowOpacity : this.props.default_shadow_height}
        // this.anim_ref.transitionTo(to_value,2000);
        // this.setState({elevation: 2})
        // this.state.shadow_height.setValue(2)
        // this._animate_scale_elevation(
        //   (this.props.hasFocus && 
        //   this.props.focused_scale) || 
        //   this.props.default_scale,
        //   (this.props.hasFocus && 
        //   this.props.focused_elevation) || 
        //   this.props.default_elevation
        //   );
        // this._animate_shadow('-2px 2px 6px -2px #000000');
        // this._animate_shadow(this.props.default_shadow_height);
        // this._animate_shadow(this.props.grabbed_shadow_height);
       }
       // onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
       //  true,
    });
    this.state = { panResponder,position,scale_anim, grabbed: false, elevation: elevation}
                   // staged_button_props: new Animated.Value({x: -10, y: -10, scale: .2}),
                   // correct_button_props: new Animated.Value({x: -10, y: 0, scale: .2}),
                   // incorrect_button_props: new Animated.Value({x: -10, y: 10, scale: .2})}
  }
  _update_scale_elevation(){
    this._animate_scale_elevation(
      (this.is_grabbed && this.props.grabbed_scale) ||
      (this.props.hasFocus && this.props.focused_scale) || 
       this.props.default_scale,

      (this.is_grabbed && this.props.grabbed_elevation) || 
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
    // var diff = next - this.state.elevation 
    // let steps = Array.from({length: n}, (x, i) => this.state.elevation+(diff*(i+1))/n);

    // let goal = 
    
    // this.setState()
    

  }
  componentDidUpdate(prevProps) {
    if (prevProps.hasFocus !== this.props.hasFocus) {
      this._update_scale_elevation()
      // this.updateAndNotify();
    }
  }

  componentDidMount () {
    console.log("MOUNT")
    
    window.setTimeout(()=>this.main_content.current.measure(this.resize_background))
  }
  resize_background(ox, oy, width, height, px, py) {
    console.log("ox: " + ox);
    console.log("oy: " + oy);
    console.log("width: " + width);
    console.log("height: " + height);
    console.log("px: " + px);
    console.log("py: " + py);
    this.setState({content_width:width})
  }

  render(){
    let skill_app = this.props.skill_app
    let handlers = this.state.panResponder.panHandlers
    let correct = true
    let incorrect = false
    let staged = true
    let innerHTML = skill_app.how
    let sbp = this.state.staged_button_props
    let cbp = this.state.correct_button_props
    let ibp = this.state.incorrect_button_props
    let hasFocus = this.props.hasFocus
    let b_scale = (hasFocus && 1.1) || 1
    let bh_scale = (hasFocus && 1.3) || 1.2
    // let shad_h = this.state.shadow_height//.interpolate({
    //   inputRange : [0,1],
    //   outputRange : [0,8],
    // })
    console.log(this.main_content)

    let shadow_props = gen_shadow(this.state.elevation);

    return(
        <Animated.View style={[styles.skill_app_container,
          // this.state.position.getLayout(),
            {transform : [
              {scale : this.state.scale_anim},
              {translateX : this.state.position.x},
              {translateY : this.state.position.y}],
            // shadowRadius: this.state.elevation * .627,
            // shadowOffset : {
            //   width : 0,
            //   height : this.state.elevation / 2
            //  },
            // elevation : this.state.elevation
           },
          shadow_props
              
          ]}>
            
          <TouchableHighlight >
           <View>
              <View {...handlers} 
              style = {[styles.main_content,
                            {width : (this.state.content_width || 100)+27}
                            ]}  >
                <Text style = {[styles.handle]}>
                      {String.fromCharCode(10303)} 
                </Text>                             
                <View style={styles.content_container} ref={this.main_content}>
                  <View  style = {styles.header}>
                    <Text style={styles.header_text}>
                      {"The Header"}
                    </Text>
                  </View>                             
                  <View style = {styles.inner} >
                    <Text style={[styles.inner_text]}>
                      {innerHTML}
                    </Text>
                  </View>
                </View>
              </View>

              <View>
                <AnimatedButton
                  parentHasFocus={hasFocus} 
                  preinitial={{x:0,y:-20,scale:.4}}
                  initial={{x:-30,y:-45,scale:b_scale}}
                  hover={{scale:bh_scale}}
                  >
                 <Text style={[styles.feedback_button,
                                  staged && styles.staged_selected]}>
                      {String.fromCharCode(8617)}
                      
                 </Text>
                </AnimatedButton>
                <AnimatedButton 
                  parentHasFocus={hasFocus}
                  preinitial={{x:0,y:-15,scale:.4}}
                  initial={{x:-30,y:-15,scale:b_scale}}
                  hover={{scale:bh_scale}}
                  >
                 <Text style={[styles.feedback_button,
                                  correct && styles.correct_selected]}>
                      {String.fromCharCode(10004)}
                 </Text>
                </AnimatedButton>
                <AnimatedButton 
                  parentHasFocus={hasFocus}
                  preinitial={{x:0,y:-5,scale:.4}}
                  initial={{x:-8,y:3,scale:b_scale}}
                  hover={{scale:bh_scale}}
                >
                 <Text style={[styles.feedback_button,
                                  incorrect && styles.correct_selected]}>
                      {String.fromCharCode(10006)}
                 </Text>
                </AnimatedButton>
            </View>
          </View>
        </TouchableHighlight> 
        </Animated.View>
    
    )
  }
}

const styles = StyleSheet.create({
  handle: {
    alignSelf: "center",
    // justifySelf: "center",
    padding : 1,
    fontSize : 20,
    width : 20,
    paddingTop: 4
    // backgroundColor : "gray"
  },
  
  
  content_container : {
    backgroundColor:"#EEEEEE", padding : 2, borderRadius: 5
  },


  skill_app_container : {
    // top: 0,
    // left: 0,
    // right: 0,
    // width : "100%",
    // backgroundColor: "skyblue",
    
    borderRadius : 10,
    // paddingLeft : 1,
    // padding : 4,
    position : "absolute",

    shadowColor: '#000',
    shadowOffset: {
        width : -2,
        height : 4
    },
    shadowRadius : 4,
    // shadowOpacity : shad_h,
    
    shadowOpacity : 0.25,
    // elevation: 10,



  },
  main_content :{
    flexDirection : 'row',
    backgroundColor: "skyblue",
    // position : "absolute",
    borderRadius : 10,
    paddingLeft : 1,
    padding : 4,
    // width : 300
    // width : 300
  },
  header : {
    backgroundColor: "#F5FCFF",
    // flexGrow: 1,
    // position : "relative",
    height : 20,
    borderRadius : 5,
    padding: 2,
    // alignItems:"center",
    
    alignSelf:"stretch",
    // justifySelf:"start",
    // width: 100,
  },
  header_text : {
    fontSize : 16,
    textAlign:"center",
    fontFamily : "Factoria",
    // numberOfLines: 1,
  },
  inner_text: {

    flex: 1,
    // textAlign: 'right'
    backgroundColor: "white",
    borderRadius : 5,
    padding : 5,
    width : '100%',
    // height : 40,

  },
  inner: {
    flex:1,
    maxWidth : 250,
    // flexDirection:"row",
    // alignSelf : 'flex-start',

    // flexShrink:1, 
    // maxWidth: 2000,
    // minWidth: 200
    
    // paddingLeft : 20,
   
    
    // height : 200,
    // borderRadius : 5,
    // padding: 5,
    // paddingTop:20,
    
  },
  feedback_button:{
    // position : "relative",
    fontSize: 20,
    width:27,
    textAlign:"center",
    borderWidth:0,
    borderRadius : 30,
    borderColor: 'gray',
    backgroundColor: "lightgray",
    // elevation : ,

    // boxShadow: '-2px 2px 6px -2px #000000',
    // shadowColor: '#000',
    // shadowOffset: {
    //     width : -2,
    //     height : 2
    // },
    // shadowOpacity : 0.25,
    // shadowRadius : 4,

  },
  incorrect_selected:{
    backgroundColor: "red",
  },
  correct_selected:{
    backgroundColor: "limegreen",
  },
  staged_selected:{
    backgroundColor: "dodgerblue",
  },
})

// const skillbox_styles = StyleSheet.create({
//   content: {
//     // "display": "flex",
//     // flex : 1,
//     alignItems: "stretch",
//     flexGrow: 1,

//     "maxHeight" : "100%",
//     // "flexDirection":"row-reverse",
//     "flexDirection":"row",
    
//     backgroundColor: "#F5FCFF",
//     // "width":"100%",
//     borderRadius: 4,
//     borderWidth: 0.5,
//     borderColor: '#d6d7da',
//     // overflow : "hidden",
    
//   },
// });

// const styles = StyleSheet.create({
  
  
  
//   match_container:{
//     display: 'flex',
//     flexDirection: 'row',
//     // borderBottomWidth: 1,
//     borderColor: 'gray',
//     // width : 100,
//     backgroundColor: "skyblue",
//     // hei : 100

//   },
//   match: {
//     flex: 1,
//     flexWrap: 'wrap',
//     // justifySelf: 'stretch',
//     padding: 3,
//     textIndent:5,
//     fontSize: 15,
//     backgroundColor: "'rgba(252,252,252,1.0)'",

//   },
//   selected_match:{
//     backgroundColor: "#b3e8ff",
//   },
// })

SkillAppBox.defaultProps = {
  grabbed_scale : 1.04,
  focused_scale : 1.025,
  default_scale : 1,
  hasFocus : true,
  grabbed_elevation : 26,
  focused_elevation : 18,
  default_elevation : 2
}

AnimatedButton.defaultProps = {
  hover_animation_speed : 60
}
// function no_op(){
//  void 0;
// }

// SkillPanel.propTypes = {
//   collapsedHeight: PropTypes.object,
//   select_callback: PropTypes.func,
// }

// SkillPanel.defaultProps = {
//   collapsedHeight: {"how": 40,
//           "where": 90,
//           "when": 90,
//           "which": 40,
//           },
//    //"darkorchid", "#feb201",   "#ff884d", "#52d0e0", "#e44161",  "#2f85ee", "#562ac6", "#cc24cc"
//    where_colors: [  "darkorchid",  "#ff884d",  "#52d0e0", "#feb201",  "#e44161", "#ed3eea", "#2f85ee",  "#562ac6", "#cc24cc"],
//    select_callback: () => {}
// }


export default SkillAppBox;
