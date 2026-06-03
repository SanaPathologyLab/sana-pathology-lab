import { StatusBar } from 'expo-status-bar';
import { StyleSheet, SafeAreaView, Platform, BackHandler } from 'react-native';
import { WebView } from 'react-native-webview';
import React, { useRef, useEffect, useState } from 'react';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const WEB_APP_URL = 'https://sana-pathology-lab.netlify.app';

export default function App() {
  const webviewRef = useRef(null);
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    const backAction = () => {
      if (canGoBack && webviewRef.current) {
        webviewRef.current.goBack();
        return true; // Prevent default behavior (exit app)
      }
      return false; // Let default behavior happen (exit app)
    };

    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      backAction
    );

    return () => backHandler.remove();
  }, [canGoBack]);

  const onNavigationStateChange = (navState) => {
    setCanGoBack(navState.canGoBack);
  };

  const onMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'DOWNLOAD_EXCEL') {
        const { base64, filename } = data;
        const fileUri = FileSystem.documentDirectory + filename;
        
        // Save the file
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Share/Open the file
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            dialogTitle: 'Download Excel',
          });
        }
      } else if (data.type === 'PRINT_HTML') {
        const { html } = data;
        await Print.printAsync({
          html: html,
        });
      }
    } catch (e) {
      console.log('Error parsing message from webview:', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView 
        ref={webviewRef}
        source={{ uri: WEB_APP_URL }} 
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        onNavigationStateChange={onNavigationStateChange}
        onMessage={onMessage}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView error: ', nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn('WebView HTTP error: ', nativeEvent);
        }}
      />
      <StatusBar style="auto" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  webview: {
    flex: 1,
  },
});
