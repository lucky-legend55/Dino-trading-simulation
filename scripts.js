let bank = 10000
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
    { name: "Lewis", total: 0, cost: 300},
    { name: "Clara", total: 0, cost: 500 },
    { name: "Durhack Dino", total: 0, cost: 1200 },
    { name: "Imogen", total: 0, cost: 200 },
    { name: "Steve", total: 0, cost: 900},
    { name: "Mia", total: 0, cost: 400 }
];

function updateBank(){
    const bankEl = document.getElementById("bankTotal");
    const introEl = document.getElementById("screen2bank");
    if (bankEl) bankEl.textContent = bank;
    if (introEl) introEl.textContent = `Bank: ${bank} Rocks`;
}

updateBank();

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
            bank = bank + dino.cost;        // selling gives the money back
            totalText.textContent = dino.total;
            updateBank();
            }
    });

    plusBtn.addEventListener("click", function () {
        if (bank>=dino.cost){
            dino.total++;
            bank= bank-dino.cost;
            totalText.textContent = dino.total;
            updateBank();
        }
    });

    box.append(label, minusBtn, totalText, plusBtn);
});