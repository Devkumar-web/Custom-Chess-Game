const socket=io();
const chess=new Chess();
const boardelement=document.querySelector(".chessboard");


let draggedPiece = null;
let sourceSquare =null;
let playerrole = null;


const renderBoard=()=>{
  const board=chess.board();
  boardelement.innerHTML="";
  board.forEach((row,rowindex)=> {
     row.forEach((square,squareindex)=> {
        const squareelement=document.createElement("div");
        squareelement.classList.add("square",
            (rowindex + squareindex)%2 === 0 ? "light":"dark"
         );
          squareelement.dataset.row = rowindex;
          squareelement.dataset.col=squareindex;
           

          if(square){
            const pieceelement = document.createElement("div");
            pieceelement.classList.add(
                "piece", square.color === "w" ? "white" :"black"
            ); 
            pieceelement.innerText = getpieceunicode(square);
            pieceelement.draggable= playerrole === square.color;

            pieceelement.addEventListener("dragstart",(e)=>{
                if(pieceelement.draggable){
                    draggedPiece=pieceelement;
                    sourceSquare={row: rowindex,col: squareindex}
                    e.dataTransfer.setData("text/plain","")
                }
            });

            pieceelement.addEventListener("dragend",(e)=>{
                draggedPiece=null;
                sourceSquare=null;
            });


            squareelement.appendChild(pieceelement);
          }

          squareelement.addEventListener("dragover",function (e){
            e.preventDefault();});

           squareelement.addEventListener("drop",function (e){
            if(draggedPiece){
                const targetsource={
                    row:parseInt(squareelement.dataset.row),
                    col:parseInt(squareelement.dataset.col) 
                };

                handlemove(sourceSquare,targetsource);
            }
          });
          boardelement.appendChild(squareelement);
        });
          
    });

    if(playerrole === "b"){
        boardelement.classList.add("flipped");
    }
    else{
        boardelement.classList.remove("flipped");
    }
  


};

const handlemove=(source,target)=>{
    const move={
        from: `${String.fromCharCode(97+source.col)}${8- source.row}`,
        to: `${String.fromCharCode(97+target.col)}${8- target.row}`,
        promotion: "q"
    }
   socket.emit("move",move);
}
  
const getpieceunicode=(piece)=>{
    const unicodepieces = {
        P:'♙', R:'♖', N:'♘', B:'♗', Q:'♕', K:'♔',
        p:'♟', r:'♜', n:'♞', b:'♝', q:'♛', k:'♚',
    };

    return unicodepieces[piece.type] || "";

}
socket.on("playerrole",function(role){
    playerrole=role;
    renderBoard();
});
socket.on("spectatorrole",function(){
    playerrole=null;
    renderBoard();
})
socket.on("boardstate",function(fen){
    chess.load(fen);
    renderBoard();
})
socket.on("move",function(move){
    chess.move(move);
    renderBoard();
})
renderBoard();