import React from 'react'
import {useQuery} from "react-apollo";
import OrderSoldToAccount from './queries/orderSoldToAccount.graphql'
import {ExtensionPoint} from "vtex.render-runtime";

import {useCssHandles} from "vtex.css-handles";
import "./sbdsefprod.sold-to-validation.css"

const SoldToValidationWrapper = () => {


    const CSS_HANDLES = [
        'soldToAcctErrorMessage',
        'errorMessegeContainer'
    ]


    const handles = useCssHandles(CSS_HANDLES)

    const {data:soldToAcctData,
        loading:soldToLoading,
        error:soldToError} = useQuery(OrderSoldToAccount,{ssr:false})


    if (soldToAcctData){
        console.log('soldToAcctData',soldToAcctData)
    }

    if (soldToLoading) {
        console.log('soldToLoading',soldToLoading)
    }

    if (soldToError) {
        console.log('soldToError',soldToError)
    }


if (!soldToAcctData?.getOrderSoldToAccount){

    console.log('soldToAcctData',soldToAcctData?.getOrderSoldToAccount)

    return(
        <div className={handles.errorMessegeContainer}>
         <div className={handles.soldToAcctErrorMessage}>
          Please select "Sold to Account"
        </div>
       </div>)

}
    return (<ExtensionPoint id="quick-order-wrapper"/>)


}
export default SoldToValidationWrapper