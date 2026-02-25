import { useEffect } from "react";
import { useAppDispatch } from "@/app/store";
import { setCredentials, setLoading } from "../store/authSlice";
import { getAccessToken } from "@/shared/utils/cookies";
import { mockGetMe } from "../api/mockAuth";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const restoreSession = async () => {
      const token = getAccessToken();
      if (token) {
        try {
          const user = await mockGetMe(token);
          dispatch(setCredentials({ user, accessToken: token }));
        } catch {
          dispatch(setLoading(false));
        }
      } else {
        dispatch(setLoading(false));
      }
    };
    restoreSession();
  }, [dispatch]);

  return null;
};

export default AuthInitializer;
