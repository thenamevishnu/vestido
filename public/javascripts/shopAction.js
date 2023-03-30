function sortShop(){
    let sortBy = document.getElementById("sort").value
    $.post("/changeShopContents",{
        sortBy:sortBy
    },
    function(res){
        location.reload()
    })
}

function filterPrice(){
    let input = document.getElementById("filter-price").value
    let value = input.split("-")
    let min = value[0]
    let max = value[1]
    $.post("/changeShopContents",{
        from:min,
        to:max
    },function(response){
        location.reload()
    })
}

function filterCategory(value){
    $.post("/changeShopContents",{
        categoryBy:value
    },function(response){
        location.reload()
    })
}

function filerSize(){
    let sizeDiv = document.getElementById("size")
    let size = sizeDiv.querySelectorAll("input[type='checkbox']")
    console.log(size);
    i=0
    obj = []
    size.forEach(async (data,index)=>{
        if(data.checked){
            value = index==0?"S":index==1?"M":index==2?"L":index==3?"XL":"XXL"
            obj.push(value)
        }
    })
    if(obj==""){
        obj="empty"
    }
    $.post("/changeShopContents",{
        size:obj
    },function(response){
        location.reload()
    })
}

function sendData(e){
    if(e.value==""){
        document.getElementById("search-data").innerHTML=""
        return;
    }
    let result = document.getElementById("search-data")
    fetch("getSearchProducts",{
        method:"POST",
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({payload:e.value})
    }).then(res=> res.json()).then(data=>{
        let payload = data.payload
        if(payload.length < 1){
            result.innerHTML = "<p>Sorry, nothing found!"
            return;
        }
        result.innerHTML = ""
        payload.forEach((item,index) => {
            if(index>=0) result.innerHTML += "<hr>"
            result.innerHTML += `<a href="/product_details/${item._id}" class="text-decoration-none text-dark"><p class="ms-3"><img width="40px" src="/images/products/${item.thumb}">${item.title}</p></a>`  
        });
        return;
    })
}

function paginationCount(value){
    let skip = ( value - 1 ) * 6
    let limit = skip + 6
    $.post("/changeShopContents",{
        pageMin : skip,
        pageMax : limit
    },
    function(res){
        document.body.scrollTop = 0;
        document.documentElement.scrollTop = 0;
        location.reload()
    })
}

function copyToClipboard(code){
    navigator.clipboard.writeText(code);
    document.getElementById(""+code+"").innerHTML = "<code class='text-secondary'>Copied <i class='fa fa-check'></i></code>";
}

function reviewPagination(param){
    $.post("/reviewPagination",{
        page:param
    },function(response){
        if(response.status){
            location.reload()
        }
    })
}

function reviews(param,product_id){
    $.post("/reviewsSort",{
        sort : param,
        product_id:product_id
    },function(response){
        if(response.status){
            location.reload()
        }
    })
}