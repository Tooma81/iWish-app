import { ViewStyle, Platform } from 'react-native';

export const customTabBarStyle = {
  borderTopWidth: 0, 
  elevation: 0, 
  shadowOpacity: 0,
  backgroundColor: '#fffaf7ff',
  height: 100,
  borderRadius: 32,
  position: 'absolute',
  bottom: Platform.OS === 'ios' ? -15 : 0,
} satisfies ViewStyle;