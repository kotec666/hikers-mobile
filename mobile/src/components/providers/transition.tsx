import React, {useState, useEffect} from "react";
import Load from "@/pages/load.tsx";

const withTransition = (WrappedComponent: React.ComponentType) => {
    return (props: any) => {
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            const loadData = async () => {
                await new Promise((resolve) => setTimeout(resolve, 400))
                setLoading(false);
            };

            loadData();
        }, []);

        return (
            <div>
                {/* good variant - when page is loading - we see Loader*/}
                <Load loading={loading}/>
                <WrappedComponent {...props} />

                {/* bad variant because component renders Loader and then Component */}
                {/*{loading ? (*/}
                {/*    <Load/>*/}
                {/*) : (*/}
                {/*    <WrappedComponent {...props} />*/}
                {/*)}*/}
            </div>
        );
    };
};

export default withTransition;