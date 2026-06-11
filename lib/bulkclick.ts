import { Console } from "console"

 export async function sendOTP(phone:string) {


    if(!phone){
        return {
            success:false,
            message:"Phone number is required"
        } 
    }

    try {
        // const senderId =await fetch('https://api.bulkclix.com/api/v1/sms-api/requestSenderId',{
        //     method: 'POST',
        //     headers:{
        //         "Content-Type": "application/json",
        //         "x-api-key":`${process.env.BULKCLICK_API_KEY}`
        //     },
        //        body:JSON.stringify({
        //         name:'NexaBundles',
        //         desc: "Your OTP code from Bulkclix"
        //        })
          
        // })
    //     const ID = await senderId.json()
    //    console.log("sender Id:  ",ID)

       const res2 = await fetch("https://api.bulkclix.com/api/v1/sms-api/senderIds",
        {
            method: 'GET',
            headers:{
                "Content-Type": "application/json",
                "x-api-key":`${process.env.BULKCLICK_API_KEY}`
            },
        }
       )

       const senderIds = await res2.json()
       console.log("Sender IDs:  ",senderIds)



        const res = await  fetch('https://api.bulkclix.com/api/v1/sms-api/otp/send',{
        method: 'POST',
        headers:{
            "Content-Type": "application/json",
            "x-api-key":`${process.env.BULKCLICK_API_KEY}`
        },
        body:JSON.stringify({
        phoneNumber:phone,
        senderId:process.env.BULKCLICK_SENDER_ID,
        message:"Your Bulkclix access code is <%otp_code%>",
        expiry:5,
        length:4 
})

        })
        const result = await res.json()
        console.log(result)
        return result
        
    } catch (error:any) {
        console.log(error)
        return({
            success:false,
            message:error.message
        })
        
    }
    
    
}


export async function verifyOTP(phone:string, reqId:string,otp:string){
    try {
        const res = await  fetch('https://api.bulkclix.com/api/v1/sms-api/otp/verify',
            {method: 'POST',
                headers:{
                    "Content-Type": "application/json",
                    "x-api-key":`${process.env.BULKCLICK_API_KEY}`
                },

                body:JSON.stringify({
                    phoneNumber:phone,
                    requestId: `${reqId}`, 
                    code: `${otp}`
                  
                })
                })
        const result = await res.json()
        console.log(result)
        return result
    } catch (error:any) {
        return({
            success:false,
            message:error.message
        })
    }
}