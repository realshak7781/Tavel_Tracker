import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db =new pg.Client({
  user: 'postgres',
  password: '973743_k_s',
  host: 'localhost',
  port: 5432,
  database: 'world',
});

db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

async function checkVisited(){
  const result= await db.query("SELECT country_code FROM visited_countries");
  let countries=[];

  result.rows.forEach((country)=>{
    countries.push(country.country_code);
  })
  return countries;
}


app.get("/", async (req, res) => {
  const result=await db.query("SELECT country_code FROM visited_countries");
  let countries=[];

  result.rows.forEach((country)=>{
    countries.push(country.country_code);
  })

  console.log(result.rows);
  res.render("index.ejs",{
    countries: countries,
    total:countries.length
  });

});


app.post("/add",async(req,res)=>{
  const input = req.body["country"];
   try {
    const result = await db.query("SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%';",
      [input.toLowerCase()]
    );
    const data=result.rows[0];
    const cCode=data.country_code;
    
    try {
      await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)",[cCode]);
      res.redirect("/");
    } catch (error) {
      // country already added and user is trying to add country again
      console.log(error);
      const countries=await checkVisited();
      res.render("index.ejs",{
        countries:countries,
        total:countries.length,
        error:"Country has already been added,Try again"
      });
    }

   } catch (error) {
    // the country name doesnt exist in the database
    console.log(error);
    const countries=await checkVisited();
      res.render("index.ejs",{
        countries:countries,
        total:countries.length,
        error:"Country does not Exist,Try again"
      });
   }
  
  
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
