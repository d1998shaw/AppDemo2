let express=require("express");
let app=express();
let cors=require("cors");

app.use(express.json());
const corsOptions={
    origin:'https://9d80-103-211-54-194.ngrok-free.app',
    Credentials:true,
    optionSuccessStatus:200
}
app.use(cors(corsOptions));
app.use(function(req,res,next){
    res.setHeader("Access-Control-Allow-Origin","*");
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET","POST","OPTIONS","PUT","PATCH","DELETE","HEAD"
    );
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin,X-Requested-With,Content-Type,Accept"
    );
    next();
});
var port=process.env.PORT||2410;
app.listen(port,()=>console.log(`Node app listening on port ${port}!`));

const {Client}=require("pg");
const client=new Client({
    user:"postgres",
    password:"9jdvGQvhH9dyAvEd",
    database:"postgres",
    port:5432,
    host:"db.guaiczkgmflqvyhohxtq.supabase.co",
    ssl:{rejectUnauthorized:false},
});

client.connect(function(res,error){
console.log(`Connected!!!!`);
});

app.get("/products",function(req,res){
    let sql=`SELECT * FROM products2`;
    client.query(sql,function(err,result1){
        if(err) res.send("Error in Database",err);
        else{
        res.send(result1.rows);
    } 
    })
})
app.post("/products",function(req,res,next){
    console.log("Inside post of user");
    const { productname, category, description } = req.body;
    var values=[productname,category,description];
    console.log(values);
    const query=`INSERT INTO products2(productname,category,description) VALUES($1,$2,$3)`;
    client.query(query,values,function(err,result){
        if (err){
            res.status(400).send(err);
        }
        res.send(`insertion successful`);
    });
});

app.get("/shops",function(req,res){
    let sql=`SELECT * FROM shops2`;
    client.query(sql,function(err,result1){
        if(err) res.send("Error in Database",err);
        else{
        res.send(result1.rows);
    } 
    })
})
app.get("/shop/:shopid",function(req,res){
    let id=+req.params.shopid;
    let value=[id];
    let sql=`SELECT * FROM purchases2 WHERE shopid=$1`;
    client.query(sql,value,function(err,result){
        if(err) res.send(err);
        else res.send(result.rows);
    })
})

app.get("/product/:productid",function(req,res){
    let id=+req.params.productid;
    let value=[id];
    let sql=`SELECT * FROM purchases2 WHERE productid=$1`;
    client.query(sql,value,function(err,result){
        if(err) res.send(err);
        else res.send(result.rows);
    })
})
app.get("/prod/:productid",function(req,res){
    let id=+req.params.productid;
    let value=[id];
    let sql=`SELECT * FROM products2 WHERE productid=$1`;
    client.query(sql,value,function(err,result){
        if(err) res.send(err);
        else res.send(result.rows);
    })
})

app.post("/shops",function(req,res,next){
    console.log("Inside post of user");
    const {name,rent}=req.body;
    var values=[name,rent];
    console.log(values);
    const query=`INSERT INTO shops2(name,rent) VALUES($1,$2)`;
    client.query(query,values,function(err,result){
        if (err){
            res.status(400).send(err);
        }
        res.send(`insertion successful`);
    });
});
app.get("/purchases",function(req,res,next){
    console.log("Inside/users get Api");
    let shop=req.query.shop;
    let product=req.query.product;
    let sort=req.query.sort;
    const query=`SELECT * FROM purchases2`;
    client.query(query,function(err,result){
        if (err) {
            console.log(err);
            res.status(400).send(err);}
            if (shop) {
                    let id=+shop.slice(2);
                    console.log("new id",id);
                    result.rows=result.rows.filter((m)=>m.shopid===id);
                    console.log("result",result.rows);
            }
             if (product) {
                        let productIds = product.split(',')
                        .map(pr => pr.replace('pr', ''))
                        .map(p => parseInt(p));
                    
                      result.rows = result.rows.filter(purchase =>
                        productIds.includes(purchase.productid)
                      );
            }
            
    if(sort==="QtyAsc"){
        result.rows=result.rows.sort((a,b)=>a.quantity-b.quantity);

       }
       if(sort==="QtyDesc"){
           result.rows=result.rows.sort((a,b)=>b.quantity-a.quantity);

          }
          if(sort==="ValueAsc"){
            result.rows=result.rows.sort((a,b)=>(a.quantity*a.price)-(b.quantity*b.price));

          }
          if(sort==="ValueDesc"){
            result.rows=result.rows.sort((a,b)=>(b.quantity*b.price)-(a.quantity*a.price));

          }
res.send(result.rows);
    });
});


app.put("/product/:editid",function(req,res,next){
    console.log("Inside put of user");
    let id=+req.params.editid;
    let {productname,category,description}=req.body;
    let values=[productname,category,description,id];
    const query=`UPDATE products2 SET productname=$1,category=$2,description=$3 WHERE productid=$4`;
    client.query(query,values,function(err,result){
        if (err){
            console.log(err);
            res.status(400).send(err);
        }
        res.send(`update successful`);
    });
});


app.post("/purchases",function(req,res,next){
    console.log("Inside post of user");
    const {shopid,productid,quantity,price} = req.body;
    var val
    ues=[shopid,productid,quantity,price];
    console.log(values);
    const query=`INSERT INTO purchases2(shopid,productid,quantity,price) VALUES($1,$2,$3,$4,$5)`;
    client.query(query,values,function(err,result){
        if (err){
            res.status(400).send(err);
        }
        res.send(`insertion successful`);
    });
});


app.get("/totalPurchase/shop/:sid",function(req,res){
    let id=+req.params.sid;
    let value=[id];
    let sql=`SELECT * FROM purchases2 WHERE shopid=$1`;
    client.query(sql,value,function(err,result){
        if(err) res.send(err);
        else{
            const countById = result.rows.reduce((countMap, obj) => {
                const { productid } = obj;
                countMap[productid] = (countMap[productid] || 0) + 1;
                return countMap;
              }, {});
              let arrWithCount = result.rows.map((obj) => {
                const { productid } = obj;
                return {
                  ...obj,
                  count: countById[productid],
                };
              });
             //to count
             arrWithCount = arrWithCount.reduce((acc, curr) => {
                const {purchaseid,shopid, productid, quantity, count,price } = curr;
                if (!acc[productid]) {
                    acc[productid] = {
                       purchaseid:purchaseid,
                       shopid:shopid,
                       productid:productid,
                       quantity: quantity,
                       price: quantity * price,
                       count:count
                    };
                } else {
                    acc[productid].quantity += quantity;
                    acc[productid].price += quantity * price;
                }
                return acc;
            }, []);  
             res.send(arrWithCount);
           

        }})
})
app.get("/total/product/:pid",function(req,res){
            let id=+req.params.pid;
            let value=[id];
            let sql=`SELECT * FROM purchases2 WHERE productid=$1`;
            client.query(sql,value,function(err,result){
                if(err) res.send(err);
                else{
                    const countById = result.rows.reduce((countMap, obj) => {
                        const { shopid } = obj;
                        countMap[shopid] = (countMap[shopid] || 0) + 1;
                        return countMap;
                      }, {});
                      let arrWithCount = result.rows.map((obj) => {
                        const { shopid } = obj;
                        return {
                          ...obj,
                          count: countById[shopid],
                        };
                      });
                     //to count
                     arrWithCount = arrWithCount.reduce((acc, curr) => {
                        const {purchaseid,shopid, productid, quantity, count,price } = curr;
                        if (!acc[shopid]) {
                            acc[shopid] = {
                               purchaseid:purchaseid,
                               shopid:shopid,
                               productid:productid,
                               quantity: quantity,
                               price: quantity * price,
                               count:count
                            };
                        } else {
                            acc[shopid].quantity += quantity;
                            acc[shopid].price += quantity * price;
                        }
                        return acc;
                    }, []);  
                     res.send(arrWithCount);
                   
        
                }
            })
        })
