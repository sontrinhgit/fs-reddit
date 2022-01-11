import { useRouter } from "next/router";
import { useEffect } from "react";
import { useMeQuery } from "../generated/graphql";

export const useCheckAuth = () => {
  //lay duoc nguoi dung hien tai dang o dau
  const router = useRouter();

  const { data, loading } = useMeQuery();


  //co nghia la k co loading nhung user da login vao roi thi se k truy cap duoc vao trang do nua va tro ve trang chu automatic 
  useEffect(() => {
    if(!loading) {
      if (
      
        data?.me &&
        (router.route === "/login" ||
          router.route === "/register" ||
          router.route === "/forgot-password" ||
          router.route === "/change-password")
      ) {
        //neu thoa man cac gia tri tren thi se dua ve trang chu
        router.replace("/");
      } else if (!data?.me && router.route !== "/login" && router.route !== "/register") //neu nhu ng dung ma chua login {
        router.replace("/login")
      }
    }
    
  , [data, loading, router]);

  return { data, loading };
};
