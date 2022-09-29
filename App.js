import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
 
export default function App() {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("Not yet scanned");
  const axios = require("axios");

  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {
    askForCameraPermission();
  }, []);

  const format = async (qrCode) => {
    const split = qrCode.split("/");
    const id = split[6];
    qrId = parseInt(id);
    qrHash = qrCode.split('/').splice(7).join('/')
    console.log('Ticket_id', qrId, 'Ticket_hash', qrHash)
  }

  const scanTicket = async (ticket_id) => {
    setText('Loading...')
    console.log("Scanning Ticket", ticket_id);
    format(ticket_id);

    const purchasedTicket = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/purchased-ticket?'
    const register = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/register'
  
    console.log('get', purchasedTicket + 'Id=' + qrId + '&hash=' + qrHash)
    try {
      const response = await axios.get(purchasedTicket + 'Id=' + qrId + '&hash=' + qrHash,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
          }
        });
      const obj = response.data[0].order[0];
      obj.hash = qrHash;
      console.log('purchasedTicket', response.status)

      const objJson = JSON.stringify(obj);

      setText('OK, User found')
      const responseRegister = await axios.post(register, objJson,
        {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Content-Type': 'application/json'
          }
        });
      console.log('responseRegister', responseRegister.status)
    } catch (error) {
      setText("Error, Try Again");
      console.log('error', error)
    }
  };

  // What happens when we scan the bar code
  const handleBarCodeScanned = ({ type, data }) => {
    format(data);
    scanTicket(data);
    setScanned(true);
    setText("Scanning....");
    console.log(data)
  };

  // Check permissions and return the screens
  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>Requesting for camera permission</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={{ margin: 10 }}>No access to camera</Text>
        <Button
          title={"Allow Camera"}
          onPress={() => askForCameraPermission()}
        />
      </View>
    );
  }

  // Return the View
  return (
    <View style={styles.container}>
      <View style={styles.barcodebox}>
        <BarCodeScanner
          onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
          style={{ height: 400, width: 400 }}
        />
      </View>
      <Text style={styles.maintext}>{text}</Text>

      {scanned && (
        <Button
          title={"Scan again?"}
          onPress={() => (setScanned(false), setText("Scanning...."))}
          color="green"
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: "center",
    justifyContent: "center",
    height: 300,
    width: 300,
    overflow: "hidden",
    borderRadius: 30,
    backgroundColor: "tomato",
  },
});
