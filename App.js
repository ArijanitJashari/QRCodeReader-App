import React, { useState, useEffect } from "react";
import { Text, View, StyleSheet, Button } from "react-native";
import { BarCodeScanner } from "expo-barcode-scanner";
import { BASE_URL } from "@env";

export default function App() {
  
  const barcode = 'https://store.pecb.com//verify/qr/2536/$2y$10$dvCp1oD2lXyAFJTmX3reouj59wRHhUFLFj2YxJLbFFpVT.Yd/ZUsm';
  const barcode2 = 'https://store.pecb.com//verify/qr/2126/$2y$10$q23q0AG.UF1EUhvlFyBTJu1r6oLgR1Ka8IZDlzQ6PIzCjxebNJdli'
  const conference = '1';
 
  const test_Id = 2536;
  const test_Hash = '$2y$10$dvCp1oD2lXyAFJTmX3reouj59wRHhUFLFj2YxJLbFFpVT.Yd/ZUsm';
  
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState("Not yet scanned");
  const axios = require("axios");
  var qrId = 0;
  var qrHash = '';
  const askForCameraPermission = () => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  };

  // Request Camera Permission
  useEffect(() => {   
    format(barcode2)
    scanTicket(barcode)
    askForCameraPermission();
  }, []);

  const format = async (qrCode)=> {
      const split = qrCode.split("/");
      const id = split[6];
      qrId = parseInt(id);
      qrHash = qrCode.split('/').splice(7).join('/')
      console.log('qrId', qrId, 'qrHash', qrHash)
  }
  
  const scanTicket = async (ticket_id) => {
    console.log("Scanning Ticket");
    format(ticket_id);
    const purchasedTicket = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/purchased-ticket?'
    const register = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/register'
    const checkTicket = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/check-ticket?'
    const registerParcitipation = 'http://conferenceticketlb-354391346.us-east-1.elb.amazonaws.com/api/ticket/register-parcitipation'
     
    await axios
      .get(
        purchasedTicket + 'Id=' + qrId + '&hash=' + qrHash,
        {},
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            'Access-Control-Allow-Headers': '*',
            Accept: "application/json",
          },
        }
      )
      .then((response) => {
        setText(response.data.message);
        console.log(response.data.data.id);
         axios
        .post(
          register,
          {},
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
              'Access-Control-Allow-Headers': '*',
              Accept: "application/json",
            },
          }
        )
        
      })
      .catch((error) => {
        console.log('eeerr',error);
      })
      .finally(() => {});
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
          onPress={() => setScanned(false)}
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
