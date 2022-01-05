import { useRouter } from "next/router"
import { useEffect } from "react";
import { useMeQuery } from '../generated/graphql';

export const useCheckAuth = () => {
    //lay duoc nguoi dung hien tai dang o dau 
    const router = useRouter()

    const {data, loading} = useMeQuery()

    useEffect(() => {
        if(!loading && data?.me && (router.route === '/login' || router.route=== '/register')) {
            //neu thoa man cac gia tri tren thi se dua ve trang chu 
            router.replace('/')
        }
    }, [data, loading, router])

    return {data, loading}
}