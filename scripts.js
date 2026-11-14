let bank = 100000
const startButton = document.getElementById("start"); //button from start page to dniosaur introduction
const intros = document.getElementById("intro");

startButton.addEventListener("click",function(){
    startButton.remove();
    intros.hidden = false;
    const bank_amount = document.getElementById("screen2bank").innerText = `Bank: ${bank} Rocks`
});

const to_simulate = document.getElementById("to_trading"); //button from dinosaur intro to simulation
const simulation = document.getElementById("simulation");

to_simulate.addEventListener("click",function(){
    to_simulate.remove();
    simulation.hidden = false;
    intros.hidden = true;
});

function openPopup(text){
    document.getElementById('popup-text').innerText = text;
    document.getElementById('popup').style.display='flex';
}

function closePopup(){
    document.getElementById('popup').style.display = 'none';
}


