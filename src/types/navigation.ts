export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  MainApp: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Booking: { selectedServiceId?: number } | undefined;
  History: undefined;
  Profile: undefined;
};