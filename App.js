import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import SkillAppBox from "./components/skill_app_box.js"
import SkillOverlay from "./components/skill_overlay.js"

const bounding_boxes = {
  "A" : {
    x : 100,
    y : 100,
    width: 100,
    height: 100,
  },
  "B" : {
    x : 250,
    y : 200,
    width: 200,
    height: 200,
  }
}

export default function App() {
  return (
    <View style={styles.container}>
      <SkillOverlay skill_applications ={[
        {"selection" : "A", "action" : "UpdateTextField", "input" : "6",
         "how": "Add(?,?,?) "},
        { "selection" : "B", "action" : "UpdateTextField", "input" : "7",
          "how": "Add(?,?,?) and a bunch of other stuff"}
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
    backgroundColor: 'beige',
    // alignItems: 'center',
    // justifyContent: 'center',
  },
});
