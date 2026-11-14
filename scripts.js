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

const dinos = [
    { name: "Lewis", total: 0 },
    { name: "Clara", total: 0 },
    { name: "Durhack Dino", total: 0 },
    { name: "Imogen", total: 0 },
    { name: "Steve", total: 0 },
    { name: "Mia", total: 0 }
];

const controlBoxes = document.querySelectorAll(".controls");

dinos.forEach(function (dino, i) {
    const box = controlBoxes[i];          // the i-th controls box in the grid

    const label = document.createElement("span");
    const totalText = document.createElement("span");
    const minusBtn = document.createElement("button");
    const plusBtn = document.createElement("button");

    label.textContent = dino.name + ": ";
    totalText.textContent = dino.total;
    minusBtn.textContent = "-";
    plusBtn.textContent = "+";
    minusBtn.className = "small-btn";
    plusBtn.className = "small-btn";

    minusBtn.addEventListener("click", function () {
        if (dino.total > 0) {
            dino.total--;
            totalText.textContent = dino.total;
        }
    });

    plusBtn.addEventListener("click", function () {
        dino.total++;
        totalText.textContent = dino.total;
    });

    box.append(label, minusBtn, totalText, plusBtn);
});