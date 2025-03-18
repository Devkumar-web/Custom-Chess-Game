const express=require("express");
const socket=require("socket.io");
const http=require("http");
const {Chess}=require("chess.js");
const path=require("path");


const app=express();
const server=http.createServer(app);
const io=socket(server);

const chess=new Chess();
 let players={};
 let currentplayer="w";

app.set("view engine","ejs");
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
    res.render("index",{title:"Chess Game"});
})
io.on("connection",function(uniquesocket){
    console.log("connected");
    if(!players.white){
        players.white=uniquesocket.id;
        uniquesocket.emit("playerrole","w");
    }
    else if(!players.black){
        players.black=uniquesocket.id;
        uniquesocket.emit("playerrole","b")
    }
    else{
        uniquesocket.emit("spectatorrole")
    }

    uniquesocket.on("disconnect",function(){
        if(uniquesocket.id===players.black){
            delete players.black;
        }
        else if(uniquesocket.id === players.white){
            delete players.white;
        }
    })

    uniquesocket.on("move",(move)=>{
        try{
            if(chess.turn() === "w" && uniquesocket.id !== players.white) return ;
            if(chess.turn() === "b" && uniquesocket.id !== players.black) return ;

           const result= chess.move(move);
           if(result){
            currentplayer=chess.turn();
           
           io.emit("move",move);
           io.emit("boardstate",chess.fen())
        }else {
            console.log("invalid move :",move);
            uniquesocket.emit("invalidmove",move);
        }
        }catch(err){
            console.log(err);
            uniquesocket.emit("Invalidmove :",move);
        }
    });


});

server.listen(3000,function(){

})