const startButton = document.getElementById("start");
const game = document.getElementById("game");

startButton.addEventListener("click",function(){
    startButton.remove();
    game.hidden = false;
});