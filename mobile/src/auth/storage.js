import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "dershane.accessToken";
const REFRESH_TOKEN_KEY = "dershane.refreshToken";
const USER_KEY = "dershane.user";

export async function readStoredSession() {
  const accessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  const rawUser = await AsyncStorage.getItem(USER_KEY);

  let user = null;
  if (rawUser) {
    try {
      user = JSON.parse(rawUser);
    } catch {
      user = null;
    }
  }

  return { accessToken, refreshToken, user };
}

export async function writeStoredSession({ accessToken, refreshToken, user }) {
  if (accessToken) await AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  else await AsyncStorage.removeItem(ACCESS_TOKEN_KEY);

  if (refreshToken) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

  if (user) await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  else await AsyncStorage.removeItem(USER_KEY);
}

export async function clearStoredSession() {
  await AsyncStorage.multiRemove([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY]);
}
