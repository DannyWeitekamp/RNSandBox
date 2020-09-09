import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SkillAppBox from "./components/skill_app_box.js"
import SkillOverlay from "./components/skill_overlay.js"

const bounding_boxes = {
  "A" : {
    type : "TextField",
    x : 100,
    y : 100,
    width: 100,
    height: 100,
  },
  "B" : {
    type : "TextField",
    x : 250,
    y : 200,
    width: 200,
    height: 200,
  },
  "C" : {
    type : "TextField",
    x : 250,
    y : 100,
    width: 100,
    height: 100,
  },
  "D" : {
    type : "TextField",
    x : 50,
    y : 300,
    width: 100,
    height: 100,
  },
  "Button" : {
    type : "Button",
    x : 150,
    y : 500,
    width: 100,
    height: 50,
  },
  "E" : {
    type : "TextField",
    x : 500,
    y : 300,
    width: 100,
    height: 100,
  },
  "F" : {
    type : "TextField",
    x : 650,
    y : 300,
    width: 100,
    height: 100,
  },
}

export default function App() {
  let fake_items = []
  for(let bb_n in bounding_boxes){
    let bb = bounding_boxes[bb_n]
    fake_items.push(
      <View style={{left: bb.x,
                    top: bb.y,
                    width: bb.width,
                    height: bb.height,
                    backgroundColor : 'rgba(180,180,180,.3)',
                    position: "absolute"
                  }}/> 
    )
  }
  return (
    <View style={styles.container}>
      {fake_items}
      <SkillOverlay skill_applications ={[
        {"selection" : "A", "action" : "UpdateTextField", "input" : "6",
       "how": "Add(?,?,?) ","reward": -1, is_staged: true},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "7",
          "how": "Add(?,?,?) and a bunch of other stuff", "reward": -1},
        { "selection" : "C", "action" : "UpdateTextField", "input" : "7",
          "how": "Add(?,?,?) and a bunch of other stuff", "reward": 1,
          foci_of_attention: ["E","F"]
        },
        { "selection" : "C", "action" : "UpdateTextField", "input" : "9",
          "how": "Subtract(?,?,?) and a bunch of other stuff", "reward": 1},
        { "selection" : "D", "action" : "UpdateTextField", "input" : "7",
        "how": "Subtract(?,?,?) and a bunch of other stuff", "reward": 0},
        { "selection" : "Button", "action" : "PressButton", "input" : null,
        "how": "PushButton and a bunch of other stuff. And some Loremu Ipsum n what not",
         "reward": -1},
        ]}
        bounding_boxes = {bounding_boxes}/>
      {/*<SkillAppBox skill_app={{"how": "Add(?,?,?) and a bunch of other stuff"}}/>
      <SkillAppBox hasFocus={false} skill_app={{"how": "Add(?,?,?) and a bunch of other stuff"}}/>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeedc'//'beige',
    // backgroundColor: 'white',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
