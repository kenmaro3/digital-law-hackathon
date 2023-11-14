console.log("here")

interface ListLawToolRequest{
  [key: string]: any;
}

interface LawElement{
  [key: string]: string;

}

const get_function = async() => {

    const url = 'https://api.lawapi-prototype-test-elaws.e-gov.go.jp/api/2/keyword'
    const params: ListLawToolRequest = {}
    params["keyword"] = "駐車"
    params["limit"] = 2
    const query_params = new URLSearchParams(params); 
    console.log(query_params)
    
    return await fetch(`${url}?${query_params}`, {
        method: "GET",
    })
    .then(response => response.json())
    .then(data => {
        const res_list = []
        const items = data["items"]
        items.forEach((item) => {
            const reduced_item: LawElement = {}
            reduced_item["law_id"] = item["law_info"]["law_id"]
            reduced_item["law_num"] = item["law_info"]["law_num"]
            reduced_item["sentence"] = item["sentence"]
            res_list.push(reduced_item)

        })
        return res_list

    })
}


(async()=>{
    console.log("start")
    const res = await get_function()
    console.log(res)

})()