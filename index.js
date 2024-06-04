import express from "express"; 
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios"
import env from "dotenv";

const app=express();
const port=3000;
env.config();

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

const db= new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "bookcover",
  password:process.env.PASSWORD,
  port: "5432"
});

db.connect();

let URL="https://covers.openlibrary.org/b/isbn/"

const book=[];

app.get("/",async (req,res)=>{
try {
    const result= await db.query("SELECT * FROM book ORDER BY id ASC");
    const book=result.rows;
    res.render("index.ejs",{
        book: book
    });
} catch (err) {
    console.log(err);
}
});

app.post("/add",async (req,res)=>{
    const title=  req.body.title;
    const content= req.body.content;
    const isbn = req.body.isbn;
    const rating= req.body.rating;
    const image= URL+isbn+"-M.jpg";
    try{
    await db.query("INSERT INTO book(title,content,rating,url) VALUES($1,$2,$3,$4)",
    [title,content,rating,image]);
    }catch(err)
    {
        console.log(err);
    }   
    res.redirect("/");
    
});

app.post("/update",async (req,res)=>{
    const title=  req.body.title;
    const content= req.body.content;
    const rating= req.body.rating;
    const id=req.body.id;
    res.render("update.ejs",{
        id:id,
        title: title,
        content: content,
        rating:rating
    })
});
app.post("/edit",async(req,res)=>{
    const title=  req.body.title;
    const content= req.body.content;
    const rating= req.body.rating;
    const id=req.body.id;
    await db.query("UPDATE book SET title=$1,content=$2,rating=$3 WHERE id=$4",[title,content,rating,id]);
    res.redirect("/");
});

app.post("/delete",async(req,res)=>{
    const id=req.body.id;
    try{
        await db.query("DELETE FROM book WHERE id=$1",[id]);
    }
    catch(err)
    {
        console.log(err);
    }
    res.redirect("/");
})


app.listen(port,()=>{
    console.log(`Server running at port ${port}`);
})