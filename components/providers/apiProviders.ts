export async function handleDataBundlesHub(order: any, data: any, apiKey: string) {


  const res = await fetch(
    "https://www.databundleshub.com/api/developer/purchase",
   
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
      "phoneNumber": data.phoneNumber.trim(),
      "capacity":`${parseInt(data.bundleName)}`
      }),
    }
  );

  const result = await res.json();

  if(result.success=true) {
    order.transaction_id ="DataBundleHub -"+result.data.transactionReference;
    order.status = "processing";
    await order.save();
  }
    console.log('Databundlehub result:', result);
  return result;

}







export async  function  handleTopily(order: any, data: any, apiKey: string){

  let networkId;

  if (data.network === "MTN") networkId = 3;
  else if (data.network === "TELECEL") networkId = 2;
  else if (data.network.startsWith("AT")) networkId = 4;
  else throw new Error("Invalid network");

  const res = await fetch(
    "https://toppily.com/api/v1/buy-data-package",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        recipient_msisdn: data.phoneNumber.trim(),
        network_id: networkId,
        shared_bundle: Number(data.bundleName),
        incoming_api_ref: data.reference,
      }),
    }
  );
  const result = await res.json();

  if (result.transaction_code) {
    order.transaction_id = result.transaction_code;
    order.status = "processing";
    await order.save();
  }
    console.log('Dakazina result:', result);
  return result;


  
    
}

export async function handleAgentPortal(order: any, data: any, apiKey: string) {
  let networkKey;

  if (data.network.toUpperCase() === "MTN") networkKey = "MTN";
  else if (data.network.toUpperCase() === "TELECEL") networkKey = "Telecel";
  else if (data.network.toUpperCase().startsWith("AT")) networkKey = "AirtelTigo";
  else throw new Error("Invalid network");

  const res = await fetch("https://api.agentportalgh.com/api/queue/add", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      "service": networkKey, 
      "items": [
        { "msisdn": data.phoneNumber.trim(), "data_gb": parseInt(data.bundleName), "reference": data.reference }
      ]
    }),
  });

  const result = await res.json();

  console.log('AgentPortal result:', result);

if(result.charged){
  order.transaction_id = 'AgentPortal'+ result.batch_id;
  order.status = "processing"; 
  await order.save();
}
  console.log('AgentPortal result:', result);
  return result;
}