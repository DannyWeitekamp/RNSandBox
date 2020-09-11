import React, { Component, createRef } from 'react'
import PropTypes from 'prop-types'
import { TouchableHighlight, 
        TouchableWithoutFeedback,ScrollView,View, Text, StyleSheet,
         Animated, PanResponder,useRef,Platform, Image } from "react-native";
import { TouchableOpacity} from 'react-native-gesture-handler'

const images = {
  left_arrow: require('./img/arrow-left-bold.png'),
};

// import * as Animatable from 'react-native-animatable';
import autobind from "class-autobind";

import {simple_animate, gen_shadow} from "./vis_utils.js"

class RisingComponent extends Component {
  constructor(props){
    super(props);
    autobind(this);

    let elevation = (props.hasFocus && props.focused_elevation)
                      ||  props.default_elevation
    if(Platform.OS != 'web'){
      elevation = new Animated.Value(elevation);  
    }
    
    const scale_anim = new Animated.Value(1);
    const pos_anim = new Animated.ValueXY();

    this.is_grabbed = false

    this.state = {elevation:elevation,scale_anim,pos_anim}
  }


  _update_scale_elevation_pos(){
    // console.log("AQUI1",this.props.grabbed_scale,this.props.focused_scale,this.props.hover_scale)
    // console.log("AQUI2",this.props.grabbed_elevation,this.props.focused_elevation,this.props.hover_elevation)
    let hasFocus = this.props.hasFocus
    let is_grabbed = this.props.is_grabbed || this.is_grabbed
    let is_hover = this.props.is_hover || this.is_hover

    let next_scale = ((is_grabbed && this.props.grabbed_scale) ||
      (hasFocus && this.props.focused_scale) || 
       this.props.default_scale) //+ 
    if(is_hover){next_scale += (this.props.hover_scale||1) - 1}
    
    let next_elevation = ((is_grabbed && this.props.grabbed_elevation) || 
      (hasFocus && this.props.focused_elevation) || 
      this.props.default_elevation)// + (this.is_hover && this.props.hover_elevation)
    if(is_hover){next_elevation += (this.props.hover_elevation||0)}

    let next_pos = null
    if(this.props.default_pos != null){
      next_pos = (hasFocus && this.props.focused_pos) ||
                 (is_hover && this.props.hover_pos) ||
                  this.props.default_pos
    }
    // console.log(next_scale,next_elevation,next_pos)
    // console.log(hasFocus,is_grabbed)
    this._animate_scale_elevation_pos(next_scale,next_elevation,next_pos)
  }
  _animate_scale_elevation_pos(next_scale,next_elevation,next_pos=null,config={useNativeDriver:true,speed: 40}){
    // console.log("TO VAL", next_scale,next_elevation)

    let anims = []
    anims.push(
      Animated.spring(
        this.state.scale_anim, 
        { toValue: next_scale || 1,...config,...{useNativeDriver:true} }
      )
    )
    // simple_animate(this,'elevation',next_size,config)
    if(Platform.OS == 'web'){ //For some reason can't animate shadows on web
      simple_animate(this,'elevation',next_elevation,{...config,speed: 80})
    }else{
      anims.push(
        Animated.spring(
          this.state.elevation, 
          { toValue: next_elevation || 0,...config,...{useNativeDriver:true} }
        )
      )
    }
    if(next_pos){
      anims.push(
        Animated.spring(
          this.state.pos_anim, 
          { toValue: next_pos,...config,...{useNativeDriver:true} }
        )
      )
    }
    Animated.parallel(anims).start()
  }
  componentDidUpdate(prevProps) {
    if ( (this.props.hasFocus != null && prevProps.hasFocus !== this.props.hasFocus) ||
         (this.props.is_hover != null && prevProps.is_hover !== this.props.is_hover)) {
      this._update_scale_elevation_pos()
      // this.updateAndNotify();
    }
  }
  componentDidMount(prevProps) {
    // if (prevProps.hasFocus !== this.props.hasFocus) {
      this._update_scale_elevation_pos()
      // this.updateAndNotify();
    // }
  }
}

class AnimatedButton extends Component {
  constructor(props){
    super(props);
    autobind(this);
    const preinitial = this.props.preinitial || this.props.initial
    this.pos = new Animated.ValueXY({x: preinitial.x,y:preinitial.y})
    this.scale = new Animated.Value(preinitial.scale)
    this.is_pressed = false
    this.is_hover = false
  }
  componentDidMount(){
    this._animate_to(this.props.initial)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.parentHasFocus !== this.props.parentHasFocus) {
      this._animate_to( ((this.is_pressed || this.is_hover) && this.props.hover) ||
                          this.props.initial
      )
    }
  }

  _animate_to(next,config){
    next = {...this.props.initial, ...next}
    Animated.parallel([
      Animated.spring(
        this.pos, 
        { toValue: { x: next.x, y: next.y }
          ,...config,...{useNativeDriver : true} 
        }
      ),
      Animated.spring(
        this.scale,
        { toValue: next.scale,
          ...config,...{useNativeDriver : true}
        }
      )
    ]).start();
    
  }
  render(){
    const anim_style = {
                        position : 'absolute',
                        borderRadius: 20,
                        transform: [
                          {translateX : this.pos.x},
                          {translateY : this.pos.y},
                          {scale: this.scale}
                        ],
                        ...(this.props.hasFocus && gen_shadow(8)),
                        ...(this.props.hasFocus && {zIndex:10}),
                      }
    return (
      <Animated.View style={[anim_style]}

        onMouseEnter={Platform.OS == 'web' && (()=>{
          console.log("ENTER")
          this.is_hover = true
          this._animate_to(this.props.hover,
          {speed: this.props.hover_animation_speed})
          })
        }
        onMouseLeave={Platform.OS == 'web' && (()=>{
          this.is_hover = false
          this._animate_to(this.props.initial,
          {speed: this.props.hover_animation_speed})
          })
        }
      >
        <TouchableOpacity 
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
}

class StageButton extends RisingComponent {
  constructor(props){
    super(props);
    autobind(this)
    console.log("______", props)
    this._update_scale_elevation_pos()
    this.state={...(this.state ||{})}
    
  }
  press(){
    this.props.stageCallback()
  }
  hoverStart(){
    this.is_hover = true
    this._update_scale_elevation_pos()
  }
  hoverEnd(){
    this.is_hover = false
    this._update_scale_elevation_pos()
  }
  render(){
    let {hasFocus} = this.props
    let text_color = ( (this.props.hasFocus) && 'black') ||
                      'rgba(0,0,0,.4)'
    return(
      <View>
        <View style = {[this.props.touch_area,
          { //backgroundColor:'red',
            top:40,
            width:20,
            height:40,
            overflow:'hidden'}]}>
          <Animated.View style={[styles.stage_button,
              { top:10,
                left:8,},
              (hasFocus && {backgroundColor: 'dodgerblue'}),
              {transform : [
                {translateX: this.state.pos_anim.x},
                {translateY: this.state.pos_anim.y},
                {scale: this.state.scale_anim},
                // {scale: (this.props.force_show_other && 1.6)||1.0},
              ]},
              gen_shadow(this.state.elevation)
          ]}>
          <Image 
            style ={[{ flex:1,
                      left:-1,
                      alignSelf : (Platform.OS == 'android' && 'center') || 'auto',
                      resizeMode:'contain',
                      transform:[
                        {scale: 1.0}
                      ]},
                      (!hasFocus && {tintColor: "gray"}),
                    ]}
            source={images.left_arrow} 
          />
            
        </Animated.View>
      </View>
      <TouchableWithoutFeedback 
        onPress={this.press}
        onMouseEnter={this.hoverStart}
        onMouseLeave={this.hoverEnd}>
      <View 
        style = {this.props.touch_area}/>
      </TouchableWithoutFeedback>
    </View>
    )
  }
}

class CorrectnessTogglerKnob extends RisingComponent {
  constructor(props){
    super(props);
    autobind(this)
    // console.log("______", props)
    this._update_scale_elevation_pos()
    this.state={...(this.state ||{}),
        ...{top_hover:false, bottom_hover:false}
    }
  }
  render(){
    let text_color = ( (this.props.hasFocus || this.props.force_show_other) && 'black') ||
                      'rgba(0,0,0,.4)'
    return(
      <Animated.View style={[this.props.style,
          {transform : [
            {translateX: this.state.pos_anim.x},
            {translateY: this.state.pos_anim.y},
            {scale: this.state.scale_anim},
            {scale: (this.props.force_show_other && 1.6)||1.0},
          ]},
          gen_shadow(this.state.elevation)
      ]}>
        <Text style={[styles.feedback_button_text,
                      {color: text_color}]}>{
          this.props.inner_text || "?"
        }</Text>
      </Animated.View>
    )
  }
}

class CorrectnessToggler extends Component {
  constructor(props){
    super(props);
    autobind(this)
    this.state = {}
  }

  topHoverStart(){this.setState({top_hover:true,hover_fresh:true})}
  topHoverEnd(){this.setState({top_hover:false})}
  bottomHoverStart(){this.setState({bottom_hover:true,hover_fresh:true})}
  bottomHoverEnd(){this.setState({bottom_hover:false})}

  topPress(){this.handlePress(true)}
  bottomPress(){this.handlePress(false)}
  handlePress(is_top){
    let [correct,incorrect] = [this.getCorrect(),this.getIncorrect()]
    let undef = !correct && !incorrect
    let next_state; 
    if(undef){
      next_state = {correct:is_top,incorrect:!is_top,hover_fresh:false}
    }else{
      next_state = {correct:!correct,incorrect:!incorrect,hover_fresh:false}
    }
    if(this.props.toggleCallback){
      this.props.toggleCallback(next_state)
      this.setState({hover_fresh:false})
    }else{
      this.setState(next_state)
    }
    this.props.focusCallback(this.state.focus_index)
  }
  getCorrect(){
    if('correct' in this.state){
      return this.state.correct
    }
    return this.props.correct || false
  }
  getIncorrect(){
    if('incorrect' in this.state){
      return this.state.incorrect
    }
    return this.props.incorrect || false
  }


  render(){
    let correct = this.getCorrect()
    let incorrect = this.getIncorrect()
    // console.log("RERENDER", correct,incorrect)
    let undef = !correct && !incorrect
    let is_hover = this.state.top_hover || this.state.bottom_hover
    let disp_top_hover = (this.state.top_hover && undef) || 
                         (is_hover && this.state.hover_fresh && incorrect)
    let disp_bottom_hover =(this.state.bottom_hover && undef) ||
                           (is_hover && this.state.hover_fresh && correct)

    let bg_color = (correct && colors.c_knob_back) || 
                   (incorrect && colors.i_knob_back) ||
                   colors.u_knob_back
    return (
      
      <View
        style = {{ 
          width:30,
          position:'absolute'
      }}>
        <View
          style = {[styles.toggler,
            {backgroundColor: bg_color},//'lightgray',
        ]}>
          <View styles={{display:'flex','flexDirection':'row',alignItems:'center'}}>
            <CorrectnessTogglerKnob
              hasFocus={correct}
              force_show_other={undef}  
              is_hover={disp_top_hover}
              style={[styles.feedback_button, 
                      correct && styles.correct_selected,
                      incorrect && {backgroundColor:bg_color},
                     {zIndex: correct*10}
                ]}
              
              default_pos = {{x: -2, y: -2}}
              focused_pos = {{x: -2, y: 2}}
              inner_text={((correct || disp_top_hover || undef)
                           && String.fromCharCode(10004))||" "}
            />            
            <CorrectnessTogglerKnob
              hasFocus={incorrect}
              force_show_other={undef}
              is_hover={disp_bottom_hover}
              style={[styles.feedback_button,
                      incorrect && styles.incorrect_selected,
                      correct && {backgroundColor:bg_color},
                      {zIndex: incorrect*9}
                ]}
              default_pos = {{x: -2, y: 26}}
              focused_pos = {{x: -2, y: 18}}
              inner_text={((incorrect || disp_bottom_hover || undef)
                           && String.fromCharCode(10006))||" "}
            />            
          </View>
        </View>
        <TouchableWithoutFeedback 
          onPress={this.topPress}
          onMouseEnter={this.topHoverStart}
          onMouseLeave={this.topHoverEnd}>
        <View 
          style = {this.props.top_touch_area}/>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={this.bottomPress}
          onMouseEnter={this.bottomHoverStart}
          onMouseLeave={this.bottomHoverEnd}>
        <View 
          style = {this.props.bottom_touch_area}/>
        </TouchableWithoutFeedback>
      </View>
    )
  }
}


class SkillAppRow extends RisingComponent {
  constructor(props){
    super(props);
    autobind(this)


    this.hover_handler = Platform.OS == 'web' && ({
      onMouseEnter:()=>{
        this.is_hover = true
        this._update_scale_elevation_pos()
      },
      onMouseLeave:()=>{
        this.is_hover = false
        this._update_scale_elevation_pos()
      }
    })
    const panResponder = PanResponder.create({
       onStartShouldSetPanResponder: () => true,

       onPanResponderGrant: (evt, gestureState) => {
        // console.log("GRABBED-inner",evt)
        this.props.focusCallback()
        this._update_scale_elevation_pos()
       },
       
       onStartShouldSetPanResponder: (evt, gestureState) => true,
       onStartShouldSetPanResponderCapture: (evt, gestureState) => {
          return false
       },
        
       // onMoveShouldSetPanResponder: (evt, gestureState) => true,
       onPanResponderRelease: () => {
       }
       // onMoveShouldSetPanResponderCapture: (evt, gestureState) =>
    });
    this.state = {...(this.state||{}), hover : false,panResponder}
  }

  render(){
    let {correct, incorrect,hasFocus,staged,stageCallback} = this.props
    let bounds_color =  (correct && colors.c_bounds) || 
                        (incorrect && colors.i_bounds) || 
                        colors.u_bounds

    let border_style = ((hasFocus && {
                         padding: 0, borderWidth:4,
                         borderColor:bounds_color
                       }) ||{padding: 4, borderWidth:0}
                       )

    let handlers = this.state.panResponder.panHandlers
    return (
      <View {...handlers}>
        <CorrectnessToggler correct={correct} incorrect={incorrect}
                            toggleCallback={this.props.toggleCallback}
                            focusCallback={this.props.focusCallback}/>
        <StageButton stageCallback={stageCallback} hasFocus={staged}/>
        <Animated.View style = {[
            styles.app_row, border_style,
            {transform : [{scale:this.state.scale_anim}]},
            gen_shadow(this.state.elevation)
          ]}
            {...this.hover_handler}
        >
          <View style={[styles.header,{flexDirection:'row'}]}>
            <Text style={[styles.header_text,{textAlign:'left'}]}>{
              this.props.skill_app.input}
            </Text>
            <View style={{marginLeft:'auto',marginTop:'auto'}}>
              <Text style={styles.label_text}>{
                this.props.skill_app.skill_label || 'no label'}
              </Text>
            </View>
          </View>
          <View style={styles.inner}>
            <Text style={[styles.inner_text]}>{
                this.props.skill_app.how}
            </Text>
          </View>
        </Animated.View>
    </View>)
  }
}

class SkillAppBox extends RisingComponent{
  constructor(props){
    super(props);
    autobind(this)

    const position = new Animated.ValueXY();
    position.setOffset(this.props.initial_pos)

    this.main_content = createRef();
    this.anim_ref = null;
    this.is_grabbed = false
    this.is_hover = false
    const panResponder = PanResponder.create({
       onStartShouldSetPanResponder: () => true,

       onPanResponderGrant: (evt, gestureState) => {
        this.is_grabbed = true
        this._update_scale_elevation_pos()
        this.props.focusCallback(this.state.focus_index)
       },
       onPanResponderMove: (event, gesture) => {
          
          position.setValue({x: gesture.dx,
                              y: gesture.dy });
       },
       onStartShouldSetPanResponder: (evt, gestureState) => true,
       onStartShouldSetPanResponderCapture: (evt, gestureState) => {
          return false
       },
        
       onPanResponderRelease: () => {
        position.extractOffset();
        this.is_grabbed = false
        this.is_hover = false
        this._update_scale_elevation_pos()
       }
    });

    this.hover_handler = Platform.OS == 'web' && ({
      onMouseEnter:()=>{
        this.is_hover = true
        this._update_scale_elevation_pos()
      },
      onMouseLeave:()=>{
        this.is_hover = false
        this._update_scale_elevation_pos()
      }
    })
    this.state = {...(this.state||{}),panResponder,position, grabbed: false,
                   focus_index: 0}
  }

  // shouldComponentUpdate(nextProps, nextState){
  //   let [state,props] = [this.state,this.props]
  //   console.log("THIS PROPS", this.props)
  //   // let didUpdate = false
  //   if((Platform.OS == 'web' && nextState.elevation != state.elevation) ||
  //      nextProps.skill_applications.length != props.skill_applications.length ||
  //      nextProps.hasFocus != props.hasFocus ||
  //      nextProps.focus_index != props.focus_index ||
  //      nextProps.staged_index != props.staged_index
  //      ){
  //     return true
  //   }else{
  //     for(let i=0; i<nextProps.skill_applications.length;i++){
  //       let nsa = nextProps.skill_applications[i]
  //       let sa = props.skill_applications[i]
  //       if((nsa.reward == null) != (sa.reward == null) || nsa.reward != sa.reward){
  //         return true
  //       }
  //     }
  //   }
  //   return false
  // }

  componentDidMount () {
    // console.log("MOUNT")
    if(this.main_content && this.main_content.current){
      window.setTimeout(()=>this.main_content.current.measure(this.resize_background),100)
    }
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
    // console.time('box_rerender')
    console.log('rerender box',this.props.skill_applications[0].input)
    let {hasFocus} = this.props

    let sbp = this.state.staged_button_props
    let cbp = this.state.correct_button_props
    let ibp = this.state.incorrect_button_props
    
    let b_scale = (hasFocus && 1.1) || 1
    let bh_scale = (hasFocus && 1.3) || 1.2
    let handlers = this.state.panResponder.panHandlers

    let shadow_props = gen_shadow(this.state.elevation);
    let contents = []
    let any_staged = false
    for(let j=0; j < this.props.skill_applications.length; j++){
      let skill_app = this.props.skill_applications[j]

      let toggleCallback = this.props.toggleCallbacks[j]
      
      let correct = skill_app.reward > 0 || false
      let incorrect = skill_app.reward < 0 || false
      let staged = skill_app.is_staged || false
      let innerHTML = skill_app.how

      const focusCallback = (evt)=>{
        this.props.focusCallback(j) //Call parent focus callback
        this.setState({focus_index: j})
      }

      const stageCallback = (evt)=>{
        this.props.stageCallback(j) //Call parent focus callback
      }

      let hasFocus_j = hasFocus && (this.state.focus_index === j)
      contents.push(<SkillAppRow correct={correct}
                                 incorrect={incorrect}
                                 staged={this.props.staged_index==j}
                                 hasFocus={hasFocus_j}
                                 skill_app={skill_app}
                                 innerHTML={innerHTML}
                                 focusCallback={focusCallback}
                                 toggleCallback={toggleCallback}
                                 stageCallback={stageCallback}
                                 key={j.toString()}
                    />)
      if(staged){any_staged = true}

    }
    let correct = true
    let incorrect = true
    const out = (
        <Animated.View style={[styles.skill_app_container,
            {transform : [
              {scale : this.state.scale_anim},
              {translateX : this.state.position.x},
              {translateY : this.state.position.y}],
            zIndex : this.props.zIndex,
           },
          shadow_props
              
          ]}>
            
          <TouchableHighlight >
           <View>
              <View {...handlers}{...this.hover_handler} 
                style = {[styles.main_content,
                            {width : (this.state.content_width || 200)+27}
                            ]}  >
                
                <View style={styles.content_container} ref={this.main_content}>
                  {contents}
                </View>
                <Text style = {[styles.handle]}>
                      {String.fromCharCode(10303)} 
                </Text>                             
              </View>
              <View>
            </View>
          </View>
        </TouchableHighlight> 
        </Animated.View>
    )
    // console.timeEnd('box_rerender')
    return out
  }
}

const colors = {
  "c_bounds" : 'rgba(10,220,10,.6)',
  "i_bounds" : 'rgba(255,0,0,.6)',
  "u_bounds" : 'rgba(120,120,120,.5)',
  "c_knob" : 'limegreen',
  "i_knob" : 'red',
  "u_knob" : 'lightgray',
  "c_knob_back" : 'rgb(100,200,100)',
  "i_knob_back" : 'rgb(200,100,100)',
  "u_knob_back" : 'rgb(180,180,180)'
}


const styles = StyleSheet.create({
  handle: {
    alignSelf: "center",
    // justifySelf: "center",
    padding : 1,
    fontSize : 20,
    width : 20,
    paddingTop: 4,
    color: 'rgba(0,0,0,.5)'
    // backgroundColor : "gray"
  },
  
  
  content_container : {
    backgroundColor:"#EEEEEE", padding : 2, borderRadius: 5,
    paddingRight: 22,
  },


  skill_app_container : {
    // top: 0,
    // left: 0,
    // right: 0,
    // width : "100%",
    // backgroundColor: "skyblue",
    
    borderRadius : 15,
    // paddingLeft : 1,
    // padding : 4,
    position : "absolute",
    
    // borderOpacity: .25,

    // shadowColor: '#000',
    // shadowOffset: {
    //     width : -2,
    //     height : 4
    // },
    // shadowRadius : 4,
    // // shadowOpacity : shad_h,
    
    // shadowOpacity : 0.25,
    // elevation: 10,



  },
  main_content :{
    flexDirection : 'row',
    backgroundColor: 'rgba(141,222,255,.4)',//"skyblue",
    // opacity:
    // position : "absolute",
    borderRadius : 10,
    paddingLeft : 5,
    padding : 3,
    // width : 300
    // width : 300
  },
  app_row: {
    maxWidth : 200,
    flexDirection:"column",
    borderWidth:2.5,
    borderRadius:10,
    borderColor : 'rgba(120,120,120,.0)',
    // padding : 1,
    left: 20,
  },
  header : {
    backgroundColor: "#F5FCFF",
    borderRadius : 5,
    borderBottomLeftRadius : 0,
    borderBottomRightRadius : 0,
    borderBottomWidth : .5,
    borderBottomColor : 'lightgray'

  },
  inner: {
    // borderRadius:10,
    backgroundColor: "white",
    borderTopLeftRadius : 0,
    borderTopRightRadius : 0,
    borderBottomLeftRadius : 10,
    borderBottomRightRadius : 10,
  },

  header_text : {
    padding: 6,
    paddingBottom: 4,
    fontSize : 20,
    fontWeight: 'bold',
    textAlign:"center",
    fontFamily : "Geneva",
    minHeight: 32,
    // color : "darkdarkgray"
  },
  label_text: {
    padding:6,
    paddingRight:10,
    paddingBottom: 4,
    fontSize : 16,
    color: "gray",
    textAlign:"center",
    fontFamily : "Geneva",
  },
  inner_text: {
    flexWrap: 'wrap',
    // backgroundColor: "white",
    // borderBottomLeftRadius : 10,
    // borderBottomRightRadius : 10,
    // fontFamily : "San Fransisco",
    fontFamily : "Geneva",
    // borderRadius : 5,
    
    padding : 6,
    paddingBottom : 4,
    paddingTop : 8,
    width : '100%',
    minHeight: 20,
  },
  stage_button : {
    position: 'absolute',
    flex: 1,
    // width:27,
    width :20,
    height:12,
    borderRadius: 40,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    backgroundColor: 'rgba(190,190,190,.8)'
  },
  feedback_button_text:{
    fontSize: Platform.OS == 'android' ? 10 : 12,
    textAlign:"center",
  },
  feedback_button:{
    position: 'absolute',
    flex: 1,
    borderRadius: 40,
    width:14,
    backgroundColor: 'rgba(190,190,190,.8)'//"lightgray",
  },
  float_button:{
    fontSize: 20,
    width:27,
    textAlign:"center",
    borderWidth:0,
    borderRadius : 40,
    borderColor: 'gray',
    backgroundColor: 'rgba(190,190,190,.8)'//"lightgray",
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

  toggler: {
    height:36,
    width:12,
    left: 3,
    top: 6,
    borderColor:'rgba(120,120,120,.4)',
    borderWidth: 1,
    borderRadius: 20,
    backgroundColor: colors.u_knob_back,
    ...gen_shadow(5)
  },
})


RisingComponent.defaultProps = {
    hasFocus : false,
}

SkillAppBox.defaultProps = {
  grabbed_scale : 1.035,
  focused_scale : 1.025,
  hover_scale : 1.005,
  default_scale : 1,
  grabbed_elevation : 24,
  focused_elevation : 18,
  hover_elevation : 6,
  default_elevation : 2
}

SkillAppRow.defaultProps = {
  grabbed_scale : 1.035,
  focused_scale : 1.025,
  hover_scale : 1.005,
  default_scale : 1,
  grabbed_elevation : 16,
  focused_elevation : 12,
  hover_elevation : 4,
  default_elevation : 2
}

AnimatedButton.defaultProps = {
  hover_animation_speed : 60,
  hasFocus : false
}

CorrectnessToggler.defaultProps = {
  button_scale_elevation : {
    grabbed_scale : 1.500,
    focused_scale : 1.400,
    hover_scale : 1.200,
    default_scale : .8,

    grabbed_elevation : 10,
    focused_elevation : 8,
    hover_elevation : 6,
    default_elevation : 1
  },
  c_anim : {
    focused_pos : {x: -6, y: 0},
    default_pos : {x: -6, y: 0}
  },
  i_anim : {
    focused_pos : {x: -6, y: 40},
    default_pos : {x: -6, y: 40}
  },
  top_touch_area: { 
    width:30,
    height:24,
    position:'absolute',
    alignItems:"center",
    top: 1,//-4,
    left: -8,
    // backgroundColor: 'red',
    // opacity : .2,
  },
  bottom_touch_area: { 
    width:30,
    height:23,
    position:'absolute',
    alignItems:"center",
    top: 25,
    left: -8,
    // backgroundColor: 'blue',
    // opacity : .2,
  }
}

StageButton.defaultProps = {
  grabbed_scale : 1.500,
  focused_scale : 1.100,
  hover_scale : 1.100,
  default_scale : 1.0,

  grabbed_elevation : 10,
  focused_elevation : 4,
  hover_elevation : 2,
  default_elevation : 2,

  default_pos : {x: 2, y: 0},//{x: -18, y: 52},
  focused_pos : {x: -4, y: 0},//{x: -18, y: 52},
  hover_pos : {x: -1, y: 0},//{x: -18, y: 52},
  touch_area: { 
    top: 48,
    left: -22,
    width:36,
    height:30,
    position:'absolute',
    alignItems:"center",
    // backgroundColor: 'green',
    // opacity : .2,
  },

}

CorrectnessTogglerKnob.defaultProps = {
  ...CorrectnessToggler.defaultProps.button_scale_elevation,
  ...CorrectnessToggler.defaultProps.c_anim,
}


export default SkillAppBox;
