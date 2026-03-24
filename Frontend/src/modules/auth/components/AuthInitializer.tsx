import { useEffect } from "react";
import { useAppDispatch } from "@/app/store";
import { setCredentials, setLoading, logout } from "../store/authSlice";
import { getAccessToken, clearTokens } from "@/shared/utils/cookies";
import { useGetMeQuery } from "../api/authApi";

const AuthInitializer = () => {
  const dispatch = useAppDispatch();
  const token = getAccessToken();

  const { data, error, isLoading } = useGetMeQuery(undefined, {
    skip: !token,
  });

  useEffect(() => {
    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    if (isLoading) return;

    if (data?.success && data.data) {
      dispatch(
        setCredentials({
          user: data.data as any,
          accessToken: token,
        })
      );
    } else if (error) {
      clearTokens();
      dispatch(logout());
    }
  }, [data, error, isLoading, token, dispatch]);

  return null;
};

export default AuthInitializer;
