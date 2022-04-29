import Image from "next/image";
import styles from "../styles/Cart.module.css"
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import {
    PayPalScriptProvider,
    PayPalButtons,
    usePayPalScriptReducer
} from "@paypal/react-paypal-js";
import axios from "axios";
import { useRouter } from "next/router";
import { decrement, reset } from "../redux/cartSlice";



const Cart = () => {
    const [open, setOpen] = useState(false);
    const dispatch = useDispatch();
    const cart = useSelector(state => state.cart);
    const router = useRouter();

    const createOrder = async (data) => {
        try{
            const res = await axios.post("/api/orders", data)

            res.status === 201 && router.push("/orders/" + res.data._id);
            dispatch(reset());
        }catch(err){
            console.log(err)
        }
    }

    // This values are the props in the UI
    const amount = cart.total;
    const currency = "USD";
    const style = {"layout":"vertical"};
   

    
   // Custom component to wrap the PayPalButtons and handle currency changes
    const ButtonWrapper = ({ currency, showSpinner }) => {
    // usePayPalScriptReducer can be use only inside children of PayPalScriptProviders
    // This is the main reason to wrap the PayPalButtons in a new component
    const [{ options, isPending }, dispatch] = usePayPalScriptReducer();

    useEffect(() => {
        dispatch({
            type: "resetOptions",
            value: {
                ...options,
                currency: currency,
            },
        });
    }, [currency, showSpinner]);


    return (<>
            { (showSpinner && isPending) && <div className="spinner" /> }
            <PayPalButtons
                style={style}
                disabled={false}
                forceReRender={[amount, currency, style]}
                fundingSource={undefined}
                createOrder={(data, actions) => {
                    return actions.order
                        .create({
                            purchase_units: [
                                {
                                    amount: {
                                        currency_code: currency,
                                        value: amount,
                                    },
                                },
                            ],
                        })
                        .then((orderId) => {
                            // Your code here after create the order
                            return orderId;
                        });
                }}
                onApprove={function (data, actions) {
                    return actions.order.capture().then(function (details) {
                        const shipping = details.purchase_units[0].shipping;
    
                        createOrder({
                            customer: shipping.name.full_name,
                            address: shipping.address.address_line_1,
                            total: cart.total,
                            method: 1,  //to pay with paypal
                            title: cart.title,
                            quantity: cart.quantity,
                            price: cart.price,
                        })
                    });
                }}
            />
        </>
    );
}

    function decrements(id){
        dispatch(decrement(id))
    }


    return (
        <div className={styles.container}>
        <div className={styles.back}> 
                <Image onClick={() => router.back()} src="/img/back.png" objectFit="contain" width={50} height={50} alt="goback" />
            </div>
            <div className={styles.left}>
                <table className={styles.table}>
                    <tbody>
                        <tr className={styles.trTitle}>
                            <th>Product</th>
                            <th>Name</th>
                            <th>Price</th>
                            <th>Quantity</th>
                            <th>Total</th>
                        </tr>
                    </tbody>
                    <tbody>
                        {cart.products.map( product => (
                            <tr className={styles.tr} key={product._id}>
                                <td>
                                    <div className={styles.imgContainer}>
                                        <Image 
                                            src={product.img}
                                            layout="fill"
                                            objectFit="cover"
                                            alt=""
                                        />
                                    </div>
                                </td>
                                <td>
                                    <span className={styles.name}>{product.title} </span>
                                </td>
                    
                                <td>
                                    <span className={styles.price}> ${product.price}</span>
                                </td>
                                <td>
                                    <span className={styles.quantity}>{product.quantity}</span>
                                </td>
                                <td>
                                    <span className={styles.total}> $ {product.price * product.quantity}</span>
                                </td>
                                <td> 
                                    <button className={styles.remove} onClick={() => decrements(product._id)}> delete </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className={styles.right}>
                <div className={styles.wrapper}>
                    <h2 className={styles.title}>CART TOTAL</h2>
            
                    <div className={styles.totalText}>
                        <b className={styles.totalTextTitle}>Total: </b>
                        ${cart.total}
                    </div>
                    {open ? 
                        (
                            <div className={styles.paymentMethods}>
                                <PayPalScriptProvider
                                    options={{
                                        "client-id": "AUTFLsosgn32qirffJi6L4cNTLlAbbX9PA7Zyii7_Ov8uXCCNnEk_TUObCYv-NMFYXial_gPpJanWeJR",
                                        components: "buttons",
                                        currency: "USD",
                                        "disable-funding": "credit,card",
                                    }}
                                >
                                    <ButtonWrapper
                                        currency={currency}
                                        showSpinner={false}
                                    />
                                </PayPalScriptProvider>
                            </div>
                        ) :  (
                        <button onClick={ () => setOpen(true) } className={styles.button}>CHECK OUT</button>
                        )
                    }  
                </div>
            </div>
        </div>
      );
}
 
export default Cart;