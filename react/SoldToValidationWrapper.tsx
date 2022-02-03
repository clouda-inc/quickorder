import React from 'react'
import {useQuery} from "react-apollo";
import OrderSoldToAccount from './queries/orderSoldToAccount.graphql'
import {ExtensionPoint} from "vtex.render-runtime";


const SoldToValidationWrapper = () => {

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


if (!soldToAcctData){

    console.log('soldToAcctData',soldToAcctData)

    return(
        <div>
        Please Select Sold to Account
    </div>)

}
    return (<ExtensionPoint id="flex-layout.row"/>)


}
export default SoldToValidationWrapper